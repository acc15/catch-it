
class EngineObject {

    public live: boolean = true;

    public process(engine: Engine, delta: number): void {
    }

    public render(engine: Engine, ctx: CanvasRenderingContext2D): void {
    }

}

class Scene extends EngineObject {

    private children: EngineObject[] = [];

    public add(obj: EngineObject): Scene {
        this.children.push(obj);
        return this;
    }

    public process(engine: Engine, delta: number): void {
        let i = 0;
        while (i < this.children.length) {
            var obj = this.children[i];
            obj.process(engine, delta);
            if (!obj.live) {
                this.children.splice(i, 1);
            } else {
                ++i;
            }
        }
    }

    public render(engine: Engine, ctx: CanvasRenderingContext2D): void {
        for (let obj of this.children) {
            obj.render(engine, ctx);
        }
    }
}

class TestArrow extends EngineObject {

    private x: number = 0;

    process(engine: Engine, delta: number): void {
        this.x += 10 * delta;
    }

    render(engine: Engine, ctx: CanvasRenderingContext2D): void {
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(this.x, 100);
        ctx.stroke();
    }
}

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
        this.text((1 / delta).toFixed(2) + " FPS");
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

class Engine {

    public canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
    private prevTime: number = 0;
    private root: EngineObject;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }

    public handler(h: EngineObject): Engine {
        this.root = h;
        return this;
    }

    public start(): void {
        var engine: Engine = this;
        window.requestAnimationFrame((time) => {
            engine.process(time);
        });
    }

    private draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.root.render(this, this.context);
    }

    private process(time: number): void {
        let delta: number = (time - this.prevTime) / 1000;
        this.prevTime = time;
        this.root.process(this, delta);
        this.draw();
        this.start();
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