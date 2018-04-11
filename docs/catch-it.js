var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Point = (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.add = function (other) {
        this.x += other.x;
        this.y += other.y;
        return this;
    };
    Point.ZERO = new Point(0, 0);
    return Point;
}());
var Dimension = (function () {
    function Dimension(width, height) {
        this.width = width;
        this.height = height;
    }
    return Dimension;
}());
var Rect = (function () {
    function Rect(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    Rect.prototype.intersects = function (other) {
        return Rect.axisIntersects(this.x, this.width, other.x, other.width) &&
            Rect.axisIntersects(this.y, this.height, other.y, other.height);
    };
    Rect.axisIntersects = function (v1, l1, v2, l2) {
        return Math.max(v1 + l1, v2 + l2) - Math.min(v1, v2) < l1 + l2;
    };
    return Rect;
}());
var EngineObject = (function () {
    function EngineObject() {
        this.dead = false;
        this.engine = null;
    }
    EngineObject.prototype.markDead = function (dead) {
        if (dead === void 0) { dead = true; }
        this.dead = this.dead || dead;
    };
    EngineObject.prototype.init = function (engine) {
        this.engine = engine;
    };
    EngineObject.prototype.process = function (delta) {
    };
    EngineObject.prototype.render = function (ctx) {
    };
    return EngineObject;
}());
var Scene = (function (_super) {
    __extends(Scene, _super);
    function Scene() {
        _super.apply(this, arguments);
        this.children = [];
    }
    Scene.prototype.getChildren = function () {
        return this.children;
    };
    Scene.prototype.add = function (obj) {
        if (this.engine) {
            obj.init(this.engine);
        }
        this.children.push(obj);
        return this;
    };
    Scene.prototype.init = function (engine) {
        _super.prototype.init.call(this, engine);
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var obj = _a[_i];
            obj.init(engine);
        }
    };
    Scene.prototype.process = function (delta) {
        var i = 0;
        while (i < this.children.length) {
            var obj = this.children[i];
            obj.process(delta);
            if (obj.dead) {
                this.children.splice(i, 1);
            }
            else {
                ++i;
            }
        }
    };
    Scene.prototype.render = function (ctx) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var obj = _a[_i];
            if (obj.dead) {
                continue;
            }
            obj.render(ctx);
        }
    };
    return Scene;
}(EngineObject));
var Engine = (function () {
    function Engine(canvas) {
        this.prevTime = 0;
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
    Engine.prototype.handler = function (h) {
        if (this.root) {
            this.root.init(null);
        }
        this.root = h;
        if (this.root) {
            this.root.init(this);
        }
        return this;
    };
    Engine.prototype.start = function () {
        var engine = this;
        window.requestAnimationFrame(function (time) {
            engine.process(time);
        });
    };
    Engine.prototype.draw = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.root.render(this.context);
    };
    Engine.prototype.process = function (time) {
        var delta = time - this.prevTime;
        this.prevTime = time;
        this.root.process(delta);
        this.draw();
        this.start();
    };
    return Engine;
}());
var Label = (function (_super) {
    __extends(Label, _super);
    function Label() {
        _super.apply(this, arguments);
        this._text = "";
        this._fontSize = 20;
        this._fontFamily = "Arial";
        this._color = "black";
    }
    Label.prototype.position = function (x, y) {
        this._x = x;
        this._y = y;
        return this;
    };
    Label.prototype.align = function (x, y) {
        this._alignX = x;
        this._alignY = y;
        return this;
    };
    Label.prototype.font = function (family) {
        this._fontFamily = family;
        return this;
    };
    Label.prototype.size = function (size) {
        this._fontSize = size;
        return this;
    };
    Label.prototype.color = function (color) {
        this._color = color;
        return this;
    };
    Label.prototype.text = function (text) {
        this._text = text;
        return this;
    };
    Label.prototype.render = function (ctx) {
        ctx.font = this._fontSize + "px " + this._fontFamily;
        ctx.fillStyle = this._color;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        var text = typeof this._text === "string" ? this._text : this._text(this);
        if (this._alignX !== null) {
            var metrics = ctx.measureText(text);
            this._x = this.engine.canvas.width * this._alignX - metrics.width * this._alignX;
        }
        if (this._alignY !== null) {
            this._y = this.engine.canvas.height * this._alignY - this._fontSize * this._alignY;
        }
        ctx.fillText(text, this._x, this._y);
    };
    return Label;
}(EngineObject));
var FpsCounter = (function (_super) {
    __extends(FpsCounter, _super);
    function FpsCounter() {
        _super.apply(this, arguments);
    }
    FpsCounter.prototype.process = function (delta) {
        this.text((1000 / delta).toFixed(2) + " FPS");
    };
    return FpsCounter;
}(Label));
var Sprite = (function () {
    function Sprite(image, bounds) {
        this.image = image;
        this.bounds = bounds ? bounds : new Rect(0, 0, image.width, image.height);
    }
    Sprite.prototype.draw = function (ctx, x, y, alignX, alignY) {
        if (alignX === void 0) { alignX = 0; }
        if (alignY === void 0) { alignY = 0; }
        ctx.drawImage(this.image, this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height, x - this.bounds.width * alignX, y - this.bounds.height * alignY, this.bounds.width, this.bounds.height);
    };
    return Sprite;
}());
var GridSpriteSheet = (function () {
    function GridSpriteSheet(image, frameSize, sheetBounds, totalFrames) {
        this.image = image;
        this.frameSize = frameSize;
        this.sheetBounds = sheetBounds ? sheetBounds : new Rect(0, 0, image.width, image.height);
        this.cols = Math.floor(this.sheetBounds.width / frameSize.width);
        this.rows = Math.floor(this.sheetBounds.height / frameSize.height);
        this.totalCount = totalFrames ? totalFrames : this.rows * this.cols;
    }
    GridSpriteSheet.prototype.getTotalCount = function () {
        return this.totalCount;
    };
    GridSpriteSheet.prototype.getSprite = function (index) {
        var col = index % this.cols;
        var row = Math.floor(index / this.cols);
        return new Sprite(this.image, new Rect(this.sheetBounds.x + this.frameSize.width * col, this.sheetBounds.y + this.frameSize.height * row, this.frameSize.width, this.frameSize.height));
    };
    return GridSpriteSheet;
}());
var FrameSequences;
(function (FrameSequences) {
    function forward() {
        return function (current, delta, total) { return (current + delta) % total; };
    }
    FrameSequences.forward = forward;
    function backward() {
        return function (current, delta, total) { return (total + current - delta) % total; };
    }
    FrameSequences.backward = backward;
})(FrameSequences || (FrameSequences = {}));
var FrameDelays;
(function (FrameDelays) {
    function fps(fps, speed) {
        if (speed === void 0) { speed = 1; }
        return function (index) { return 1000 * speed / fps; };
    }
    FrameDelays.fps = fps;
})(FrameDelays || (FrameDelays = {}));
var Animation = (function () {
    function Animation(sheet, delay, initialFrame) {
        if (initialFrame === void 0) { initialFrame = 0; }
        this.timeRemainder = 0;
        this.alignX = 0;
        this.alignY = 0;
        this.sequence = FrameSequences.forward();
        this.delay = delay;
        this.sheet = sheet;
        this.frame = initialFrame;
        this.frameDelay = this.delay(this.frame);
    }
    Animation.prototype.set = function (sheet, initialFrame) {
        if (initialFrame === void 0) { initialFrame = 0; }
        this.sheet = sheet;
        this.timeRemainder = 0;
        this.frame = initialFrame;
        this.frameDelay = this.delay(this.frame);
        return this;
    };
    Animation.prototype.start = function () {
        this.frameDelay = this.delay(this.frame);
    };
    Animation.prototype.stop = function () {
        this.frameDelay = 0;
    };
    Animation.prototype.process = function (delta) {
        if (this.frameDelay <= 0 || this.sheet.getTotalCount() <= 1) {
            return;
        }
        var framesToAdvance = Math.floor(this.timeRemainder / this.frameDelay);
        if (framesToAdvance > 0) {
            this.timeRemainder = this.timeRemainder % this.frameDelay;
            this.frame = this.sequence(this.frame, framesToAdvance, this.sheet.getTotalCount());
            this.frameDelay = this.delay(this.frame);
        }
        this.timeRemainder += delta;
    };
    Animation.prototype.draw = function (ctx, x, y) {
        var frame = this.sheet.getSprite(this.frame);
        frame.draw(ctx, x, y, this.alignX, this.alignY);
    };
    Animation.prototype.align = function (x, y) {
        this.alignX = x;
        this.alignY = y;
        return this;
    };
    return Animation;
}());
var RectCollisionDetector = (function (_super) {
    __extends(RectCollisionDetector, _super);
    function RectCollisionDetector(p1, p2, solver) {
        _super.call(this);
        this.p1 = p1;
        this.p2 = p2;
        this.solver = solver;
    }
    RectCollisionDetector.prototype.process = function (delta) {
        var rect1 = this.p1.getBoundingBox();
        for (var _i = 0, _a = this.p2; _i < _a.length; _i++) {
            var obj = _a[_i];
            var rect2 = obj.getBoundingBox();
            if (rect1.intersects(rect2)) {
                this.solver(this.p1, obj);
            }
        }
    };
    return RectCollisionDetector;
}(EngineObject));
var random;
(function (random) {
    function biRange(min, max, val) {
        if (val === void 0) { val = Math.random(); }
        val = val * 2 - 1;
        return val * (max - min) + (val < 0 ? -1 : 1) * min;
    }
    random.biRange = biRange;
    function range(min, max, val) {
        if (val === void 0) { val = Math.random(); }
        return val * (max - min) + min;
    }
    random.range = range;
    function bool(val) {
        if (val === void 0) { val = Math.random(); }
        return val < 0.5;
    }
    random.bool = bool;
})(random || (random = {}));
var Sky = (function (_super) {
    __extends(Sky, _super);
    function Sky() {
        _super.apply(this, arguments);
    }
    Sky.prototype.render = function (ctx) {
        var gradient = ctx.createLinearGradient(0, 0, 0, this.engine.canvas.height);
        gradient.addColorStop(1, "#eeeeff");
        gradient.addColorStop(0.25, 'rgba(0,132,255,1)');
        gradient.addColorStop(0, 'rgba(0,60,181,1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
    };
    return Sky;
}(EngineObject));
var Hand = (function (_super) {
    __extends(Hand, _super);
    function Hand() {
        _super.call(this);
        this.nextX = 0;
        this.x = 0;
        this.y = 0;
        this.image = document.getElementById("hand");
    }
    Hand.prototype.getBoundingBox = function () {
        return new Rect(this.x - this.image.width / 2, this.y + 20, this.image.width, this.image.height - 20);
    };
    Hand.prototype.process = function (delta) {
        this.x = this.nextX;
        this.y = this.engine.canvas.height * 0.75;
    };
    Hand.prototype.render = function (ctx) {
        var drawX = this.x - this.image.width / 2;
        ctx.drawImage(this.image, drawX, this.y);
        var offset = drawX + this.image.width, width = this.engine.canvas.width - offset;
        if (width > 0) {
            ctx.drawImage(this.image, this.image.width - 1, 0, 1, this.image.height, offset, this.y, width, this.image.height);
        }
    };
    return Hand;
}(EngineObject));
var Bird = (function (_super) {
    __extends(Bird, _super);
    function Bird(shitScene, drop, height, velocity) {
        _super.call(this);
        this.x = 0;
        this.y = 0;
        this.velocityX = 0.2;
        this.animation = new Animation(new GridSpriteSheet(document.getElementById("bird"), new Dimension(181, 169), null, 14), FrameDelays.fps(30)).align(0.5, 0.5);
        this.shitScene = shitScene;
        this.dropX = drop;
        this.y = height;
        this.velocityX = velocity;
    }
    Bird.prototype.init = function (engine) {
        _super.prototype.init.call(this, engine);
        this.x = this.velocityX < 0 ? this.engine.canvas.width + 100 : -100;
    };
    Bird.prototype.process = function (delta) {
        this.x += this.velocityX * delta;
        if (this.dropX !== null && (this.velocityX > 0 ? this.x - 30 > this.dropX : this.x + 30 < this.dropX)) {
            this.shitScene.add(new BirdShit(this.dropX, this.y + 40, 0.7));
            this.dropX = null;
        }
        this.animation.process(delta);
        this.markDead(this.velocityX > 0 ? this.x > this.engine.canvas.width + 100 : this.x < -100);
    };
    Bird.prototype.render = function (ctx) {
        if (this.velocityX < 0) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.scale(-1, 1);
            ctx.translate(-this.x, -this.y);
        }
        this.animation.draw(ctx, this.x, this.y);
        if (this.velocityX < 0) {
            ctx.restore();
        }
    };
    return Bird;
}(EngineObject));
var BirdSpawn = (function (_super) {
    __extends(BirdSpawn, _super);
    function BirdSpawn(shitScene) {
        _super.call(this);
        this.timeout = -1;
        this.shitScene = shitScene;
    }
    BirdSpawn.prototype.process = function (delta) {
        if (this.timeout < 0) {
            this.add(new Bird(this.shitScene, random.range(40, this.engine.canvas.width - 40), random.range(100, 400), random.biRange(0.2, 0.5)));
            this.timeout = random.range(100, 500);
        }
        this.timeout -= delta;
        _super.prototype.process.call(this, delta);
    };
    return BirdSpawn;
}(Scene));
var BirdShit = (function (_super) {
    __extends(BirdShit, _super);
    function BirdShit(x, y, velocity) {
        _super.call(this);
        this.x = x;
        this.y = y;
        this.velocityY = velocity;
    }
    BirdShit.prototype.getBoundingBox = function () {
        return new Rect(this.x - BirdShit.RADIUS, this.y - BirdShit.RADIUS * BirdShit.Y_SCALE, BirdShit.RADIUS * 2, BirdShit.RADIUS * 2 * BirdShit.Y_SCALE);
    };
    BirdShit.prototype.process = function (delta) {
        this.y += this.velocityY * delta;
        this.markDead(this.y > this.engine.canvas.height + 50);
    };
    BirdShit.prototype.render = function (ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, BirdShit.Y_SCALE);
        ctx.translate(-this.x, -this.y);
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x, this.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#dddddd";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.x - 1, this.y - 1, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#ffffff";
        ctx.fill();
        ctx.restore();
    };
    BirdShit.RADIUS = 6;
    BirdShit.Y_SCALE = 6;
    return BirdShit;
}(EngineObject));
document.addEventListener("DOMContentLoaded", function () {
    var engine = new Engine(document.getElementById("catch-it"));
    var hand = new Hand();
    var shitScene = new Scene();
    var score = new Label().text(function () { return "SCORE: " + scoreValue; }).align(0.99, 0.01).color("white");
    var scoreValue = 0;
    var root = new Scene().
        add(new Sky()).
        add(new BirdSpawn(shitScene)).
        add(hand).
        add(shitScene).
        add(new RectCollisionDetector(hand, shitScene.getChildren(), function (p1, p2) {
        scoreValue += 500;
        p2.markDead();
    })).
        add(score).
        add(new FpsCounter().align(0.01, 0.01).color("white"));
    document.addEventListener("mousemove", function (event) {
        hand.nextX = event.pageX - engine.canvas.offsetLeft;
    });
    engine.handler(root).start();
});
//# sourceMappingURL=catch-it.js.map