
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

class Engine {

    private canvas: HTMLCanvasElement;
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
    root.add(new TestArrow()).
        add(new FpsCounter().position(10, 30).font("20px Arial"));

    engine.handler(root).start();

});