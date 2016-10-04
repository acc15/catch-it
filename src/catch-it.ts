


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

    render(engine: Engine, ctx: CanvasRenderingContext2D): void {
        ctx.font = this._font;
        ctx.font = this._font;
        ctx.fillText(this._text, this._x, this._y);
    }
}

class FpsCounter extends Label {

    public process(engine: Engine, delta: number): void {
        this.text((1000 / delta).toFixed(2) + " FPS");
    }
}

class Hand extends EngineObject {

    private image: HTMLImageElement;
    x: number = 0;
    private readonly y: number = 400;

    constructor() {
        super();
        this.image = document.getElementById("hand") as HTMLImageElement;
    }

    public render(engine: Engine, ctx: CanvasRenderingContext2D): void {
        let actualX = this.x - this.image.width / 2;

        ctx.drawImage(this.image, actualX, this.y);

        let offset = actualX + this.image.width, width = engine.canvas.width - offset;
        if (width > 0) {
            ctx.drawImage(this.image, this.image.width - 1, 0, 1, this.image.height, offset, this.y, width, this.image.height);
        }
    }
}

class Shit extends EngineObject {

    private velocity: Point = new Point(0, 0.1);
    private position: Point = new Point(0, 0);
    private animation: Animation = new Animation(
        new SpriteSheet(document.getElementById("blow") as HTMLImageElement, new Dimension(10, 20)),
        FrameDelays.fps(30)
    ).align(0.5, 0.5);

    public process(engine: Engine, delta: number): void {
        this.position.add(this.velocity);
        this.animation.process(delta);
    }

    public render(engine: Engine, ctx: CanvasRenderingContext2D): void {
        this.animation.draw(ctx, this.position.x, this.position.y);
    }
}

document.addEventListener("DOMContentLoaded", () => {

    let engine: Engine = new Engine(document.getElementById("catch-it") as HTMLCanvasElement);

    let root = new Scene();
    let hand = new Hand();
    root.add(hand).
        add(new FpsCounter().position(10, 30).font("20px Arial"));

    document.addEventListener("mousemove", (event) => {
        hand.x = event.pageX - engine.canvas.offsetLeft;
    });


    engine.handler(root).start();

});