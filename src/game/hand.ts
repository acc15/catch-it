
class Hand extends EngineObject {

    private image: HTMLImageElement;

    nextX: number = 0;
    x: number = 0;
    y: number = 0;

    constructor() {
        super();
        this.image = document.getElementById("hand") as HTMLImageElement;
    }

    getBoundingBox(): Rect {
        return new Rect(this.x - this.image.width / 2, this.y + 20, this.image.width, this.image.height - 20);
    }

    process(delta: number): void {
        this.x = this.nextX;
        this.y = this.engine.canvas.height * 0.75;
    }

    render(ctx: CanvasRenderingContext2D): void {
        let drawX = this.x - this.image.width / 2;
        ctx.drawImage(this.image, drawX, this.y);

        let offset = drawX + this.image.width, width = this.engine.canvas.width - offset;
        if (width > 0) {
            ctx.drawImage(this.image, this.image.width - 1, 0, 1, this.image.height, offset, this.y, width, this.image.height);
        }
    }
}

