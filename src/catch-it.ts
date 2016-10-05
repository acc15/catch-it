


class Label extends EngineObject {

    private _text: string = "";
    private _x: number;
    private _y: number;
    private _font: string;

    public position(x: number, y: number): Label {
        this._x = x;
        this._y = y;
        return this;
    }

    public font(font: string): Label {
        this._font = font;
        return this;
    }

    public text(text: string): Label {
        this._text = text;
        return this;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.font = this._font;
        ctx.fillStyle = "white";
        ctx.fillText(this._text, this._x, this._y);
    }
}

class FpsCounter extends Label {

    process(delta: number): void {
        this.text((1000 / delta).toFixed(2) + " FPS");
    }
}

class Hand extends EngineObject {

    private image: HTMLImageElement;

    x: number = 0;

    constructor() {
        super();
        this.image = document.getElementById("hand") as HTMLImageElement;
    }

    render(ctx: CanvasRenderingContext2D): void {
        let actualX = this.x - this.image.width / 2;
        let y = this.engine.canvas.height * 0.75;

        ctx.drawImage(this.image, actualX, y);

        let offset = actualX + this.image.width, width = this.engine.canvas.width - offset;
        if (width > 0) {
            ctx.drawImage(this.image, this.image.width - 1, 0, 1, this.image.height, offset, y, width, this.image.height);
        }
    }
}

class Sky extends EngineObject {

    render(ctx: CanvasRenderingContext2D): void {
        let gradient = ctx.createLinearGradient(0, 0, 0, this.engine.canvas.height);
        gradient.addColorStop(1, "#eeeeff");
        gradient.addColorStop(0.25, 'rgba(0,132,255,1)');
        gradient.addColorStop(0, 'rgba(0,60,181,1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
    }
}

class Bird extends EngineObject {

    private x: number = 0;
    private y: number = 0;
    private dropX: number;
    private shitScene: Scene;

    private velocityX: number = 0.2;

    private animation: Animation = new Animation(
        new GridSpriteSheet(document.getElementById("bird") as HTMLImageElement, new Dimension(181, 169), null, 14),
        FrameDelays.fps(30)
    ).align(0.5, 0.5);

    constructor(shitScene: Scene, drop: number, height: number, velocity: number) {
        super();
        this.shitScene = shitScene;
        this.dropX = drop;
        this.y = height;
        this.velocityX = velocity;
    }

    init(engine: Engine): void {
        super.init(engine);
        this.x = this.velocityX < 0 ? this.engine.canvas.width + 100 : -100;
    }

    process(delta: number): void {
        this.x += this.velocityX * delta;
        if (this.dropX !== null && (this.velocityX > 0 ? this.x - 30 > this.dropX : this.x + 30 < this.dropX)) {
            this.shitScene.add(new BirdShit(this.dropX, this.y + 40, 0.7));
            this.dropX = null;
        }
        this.live = this.velocityX > 0 ? this.x < this.engine.canvas.width + 100 : this.x > -100;
        this.animation.process(delta);
    }

    render(ctx: CanvasRenderingContext2D): void {
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
    }
}

class BirdSpawn extends Scene {

    private timeout: number = BirdSpawn.generateSpawnTimeout();
    private shitScene: Scene;

    constructor(shitScene: Scene) {
        super();
        this.shitScene = shitScene;
    }

    process(delta: number): void {
        this.timeout -= delta;
        if (this.timeout < 0) {
            this.add(new Bird(this.shitScene,
                BirdSpawn.generateRange(40, this.engine.canvas.width - 40),
                BirdSpawn.generateRange(100, 400),
                BirdSpawn.generateBirdVelocity()));
            this.timeout = BirdSpawn.generateSpawnTimeout();
        }
        super.process(delta);
    }

    private static generateBirdVelocity(): number {
        let vel = BirdSpawn.generateRange(0.2, 0.5);
        return BirdSpawn.generateBoolean() ? vel : -vel;
    }

    private static generateSpawnTimeout(): number {
        return BirdSpawn.generateRange(1000, 3000);
    }

    private static generateBoolean() {
        return Math.random() < 0.5;
    }

    private static generateRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

}

class BirdShit extends EngineObject {

    private x: number;
    private y: number;
    private velocityY: number;

    constructor(x: number, y: number, velocity: number) {
        super();
        this.x = x;
        this.y = y;
        this.velocityY = velocity;
    }

    process(delta: number): void {
        this.y += this.velocityY * delta;
        this.live = this.y < this.engine.canvas.height + 50;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(1, 6);
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
    }
}

document.addEventListener("DOMContentLoaded", () => {

    let engine: Engine = new Engine(document.getElementById("catch-it") as HTMLCanvasElement);

    let hand = new Hand();
    let shitScene = new Scene();
    let root = new Scene().
        add(new Sky()).
        add(new BirdSpawn(shitScene)).
        add(hand).
        add(shitScene).
        add(new FpsCounter().position(10, 30).font("20px Arial"));

    document.addEventListener("mousemove", (event) => {
        hand.x = event.pageX - engine.canvas.offsetLeft;
    });

    engine.handler(root).start();

});