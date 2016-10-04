
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
        let engine: Engine = this;
        window.requestAnimationFrame((time) => {
            engine.process(time);
        });
    }

    private draw() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.root.render(this, this.context);
    }

    private process(time: number): void {
        let delta: number = time - this.prevTime;
        this.prevTime = time;
        this.root.process(this, delta);
        this.draw();
        this.start();
    }

}
