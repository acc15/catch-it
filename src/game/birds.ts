

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
        this.animation.process(delta);
        this.markDead(this.velocityX > 0 ? this.x > this.engine.canvas.width + 100 : this.x < -100);
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

    private timeout: number = -1;
    private shitScene: Scene;

    constructor(shitScene: Scene) {
        super();
        this.shitScene = shitScene;
    }

    process(delta: number): void {
        if (this.timeout < 0) {
            this.add(new Bird(this.shitScene,
                random.range(40, this.engine.canvas.width - 40),
                random.range(100, 400),
                random.biRange(0.2, 0.5)));
            this.timeout = random.range(100, 500);
        }
        this.timeout -= delta;
        super.process(delta);
    }
}

class BirdShit extends EngineObject {

    private static readonly RADIUS = 6;
    private static readonly Y_SCALE = 6;

    private x: number;
    private y: number;
    private velocityY: number;

    constructor(x: number, y: number, velocity: number) {
        super();
        this.x = x;
        this.y = y;
        this.velocityY = velocity;
    }

    getBoundingBox(): Rect {
        return new Rect(this.x - BirdShit.RADIUS,
            this.y - BirdShit.RADIUS * BirdShit.Y_SCALE,
            BirdShit.RADIUS * 2,
            BirdShit.RADIUS * 2 * BirdShit.Y_SCALE);
    }

    process(delta: number): void {
        this.y += this.velocityY * delta;
        this.markDead(this.y > this.engine.canvas.height + 50);
    }

    render(ctx: CanvasRenderingContext2D): void {
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
    }
}
