
class Frame {
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

interface FrameBundle {
    getTotalFrames(): number;
    getFrame(index: number): Frame;
}

class SpriteSheet implements FrameBundle {

    private image: HTMLImageElement;
    private frameSize: Dimension;
    private sheetBounds: Rect;
    private totalFrames: number;
    private cols: number;
    private rows: number;

    constructor(image: HTMLImageElement, frameSize: Dimension, sheetBounds?: Rect, totalFrames?: number) {
        this.image = image;
        this.frameSize = frameSize;
        this.sheetBounds = sheetBounds ? sheetBounds : new Rect(0, 0, image.width, image.height);
        this.cols = Math.floor(this.sheetBounds.width / frameSize.width);
        this.rows = Math.floor(this.sheetBounds.height / frameSize.height);
        this.totalFrames = totalFrames ? totalFrames : this.rows * this.cols;
    }

    getTotalFrames(): number {
        return this.totalFrames;
    }

    getFrame(index: number): Frame {

        let col = index % this.cols;
        let row = Math.floor(index / this.cols);

        return new Frame(this.image, new Rect(
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

    private frameIndex: number;
    private timeRemainder: number = 0;
    private frameDelay: number;
    private alignX: number = 0;
    private alignY: number = 0;
    private bundle: FrameBundle;

    public delay: FrameDelay;
    public sequence: FrameSequence = FrameSequences.forward();

    constructor(bundle: FrameBundle, delay: FrameDelay, initialFrame: number = 0) {
        this.delay = delay;
        this.bundle = bundle;
        this.frameIndex = initialFrame;
        this.frameDelay = this.delay(this.frameIndex);
    }

    public set(bundle: FrameBundle, initialFrame: number = 0): Animation {
        this.bundle = bundle;
        this.timeRemainder = 0;
        this.frameIndex = initialFrame;
        this.frameDelay = this.delay(this.frameIndex);
        return this;
    }

    public start(): void {
        this.frameDelay = this.delay(this.frameIndex);
    }

    public stop(): void {
        this.frameDelay = 0;
    }

    public process(delta: number): void {
        if (this.frameDelay <= 0 || this.bundle.getTotalFrames() <= 1) {
            return;
        }

        let framesToAdvance = Math.floor(this.timeRemainder / this.frameDelay);
        if (framesToAdvance > 0) {
            this.timeRemainder = this.timeRemainder % this.frameDelay;
            this.frameIndex = this.sequence(this.frameIndex, framesToAdvance, this.bundle.getTotalFrames());
            this.frameDelay = this.delay(this.frameIndex);
        }
        this.timeRemainder += delta;
    }

    public draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
        let frame = this.bundle.getFrame(this.frameIndex);
        frame.draw(ctx, x, y, this.alignX, this.alignY);
    }

    public align(x: number, y: number): Animation {
        this.alignX = x;
        this.alignY = y;
        return this;
    }
}