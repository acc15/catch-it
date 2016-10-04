
class Sprite {
    image: HTMLImageElement;
    bounds: Rect;

    constructor(image: HTMLImageElement, bounds?: Rect) {
        this.image = image;
        this.bounds = bounds ? bounds : new Rect(0, 0, image.width, image.height);
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number, alignX: number = 0, alignY: number = 0) {
        ctx.drawImage(this.image, this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height,
            x - this.bounds.width * alignX,
            y - this.bounds.height * alignY,
            this.bounds.width, this.bounds.height);
    }
}

interface SpriteSheet {
    getTotalCount(): number;
    getSprite(index: number): Sprite;
}

class GridSpriteSheet implements SpriteSheet {

    private image: HTMLImageElement;
    private frameSize: Dimension;
    private sheetBounds: Rect;
    private totalCount: number;
    private cols: number;
    private rows: number;

    constructor(image: HTMLImageElement, frameSize: Dimension, sheetBounds?: Rect, totalFrames?: number) {
        this.image = image;
        this.frameSize = frameSize;
        this.sheetBounds = sheetBounds ? sheetBounds : new Rect(0, 0, image.width, image.height);
        this.cols = Math.floor(this.sheetBounds.width / frameSize.width);
        this.rows = Math.floor(this.sheetBounds.height / frameSize.height);
        this.totalCount = totalFrames ? totalFrames : this.rows * this.cols;
    }

    public getTotalCount(): number {
        return this.totalCount;
    }

    public getSprite(index: number): Sprite {

        let col = index % this.cols;
        let row = Math.floor(index / this.cols);

        return new Sprite(this.image, new Rect(
                this.sheetBounds.x + this.frameSize.width * col,
                this.sheetBounds.y + this.frameSize.height * row,
                this.frameSize.width,
                this.frameSize.height));
    }

}

/**
 * Computes index of next frame based on current frame index and total frame amount
 * @param current current frame index
 * @param delta amount of frame to advance
 * @param total total amount of frames
 */
interface FrameSequence {
    (current: number, delta: number, total: number): number;

}

namespace FrameSequences {
    export function forward(): FrameSequence {
        return (current, delta, total) => (current + delta) % total;
    }

    export function backward(): FrameSequence {
        return (current, delta, total) => (total + current - delta) % total;
    }
}

/**
 * Computes frame delay based on frame index
 * @param index frame index
 * @returns frame delay in milliseconds
 */
interface FrameDelay {
    (index: number): number;
}

namespace FrameDelays {
    export function fps(fps: number, speed: number = 1): FrameDelay {
        return index => 1000 * speed / fps;
    }
}

class Animation {

    private frame: number;
    private timeRemainder: number = 0;
    private frameDelay: number;
    private alignX: number = 0;
    private alignY: number = 0;
    private sheet: SpriteSheet;

    public delay: FrameDelay;
    public sequence: FrameSequence = FrameSequences.forward();

    constructor(sheet: SpriteSheet, delay: FrameDelay, initialFrame: number = 0) {
        this.delay = delay;
        this.sheet = sheet;
        this.frame = initialFrame;
        this.frameDelay = this.delay(this.frame);
    }

    public set(sheet: SpriteSheet, initialFrame: number = 0): Animation {
        this.sheet = sheet;
        this.timeRemainder = 0;
        this.frame = initialFrame;
        this.frameDelay = this.delay(this.frame);
        return this;
    }

    public start(): void {
        this.frameDelay = this.delay(this.frame);
    }

    public stop(): void {
        this.frameDelay = 0;
    }

    public process(delta: number): void {
        if (this.frameDelay <= 0 || this.sheet.getTotalCount() <= 1) {
            return;
        }

        let framesToAdvance = Math.floor(this.timeRemainder / this.frameDelay);
        if (framesToAdvance > 0) {
            this.timeRemainder = this.timeRemainder % this.frameDelay;
            this.frame = this.sequence(this.frame, framesToAdvance, this.sheet.getTotalCount());
            this.frameDelay = this.delay(this.frame);
        }
        this.timeRemainder += delta;
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        let frame = this.sheet.getSprite(this.frame);
        frame.draw(ctx, x, y, this.alignX, this.alignY);
    }

    public align(x: number, y: number): Animation {
        this.alignX = x;
        this.alignY = y;
        return this;
    }
}