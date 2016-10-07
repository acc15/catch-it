
class EngineObject {

    public dead: boolean = false;
    public engine: Engine = null;

    markDead(dead: boolean = true) {
        this.dead = this.dead || dead;
    }

    init(engine: Engine): void {
        this.engine = engine;
    }

    process(delta: number): void {
    }

    render(ctx: CanvasRenderingContext2D): void {
    }

}

class Scene extends EngineObject {

    private children: EngineObject[] = [];

    getChildren(): EngineObject[] {
        return this.children;
    }

    add(obj: EngineObject): Scene {
        if (this.engine) {
            obj.init(this.engine);
        }
        this.children.push(obj);
        return this;
    }

    init(engine: Engine): void {
        super.init(engine);
        for (let obj of this.children) {
            obj.init(engine);
        }
    }

    process(delta: number): void {
        let i = 0;
        while (i < this.children.length) {
            var obj = this.children[i];
            obj.process(delta);
            if (obj.dead) {
                this.children.splice(i, 1);
            } else {
                ++i;
            }
        }
    }

    render(ctx: CanvasRenderingContext2D): void {
        for (let obj of this.children) {
            if (obj.dead) {
                continue;
            }
            obj.render(ctx);
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
        if (this.root) {
            this.root.init(null);
        }
        this.root = h;
        if (this.root) {
            this.root.init(this);
        }
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
        this.root.render(this.context);
    }

    private process(time: number): void {
        let delta: number = time - this.prevTime;
        this.prevTime = time;
        this.root.process(delta);
        this.draw();
        this.start();
    }

}
