
interface LabelFormatter {
    (label: Label): string;
}

class Label extends EngineObject {

    private _text: string | LabelFormatter = "";
    private _x: number;
    private _y: number;
    private _alignX: number;
    private _alignY: number;
    private _fontSize: number = 20;
    private _fontFamily: string = "Arial";
    private _color: string = "black";

    public position(x: number, y: number): Label {
        this._x = x;
        this._y = y;
        return this;
    }

    public align(x: number, y: number): Label {
        this._alignX = x;
        this._alignY = y;
        return this;
    }

    public font(family: string): Label {
        this._fontFamily = family;
        return this;
    }

    public size(size: number): Label {
        this._fontSize = size;
        return this;
    }

    public color(color: string): Label {
        this._color = color;
        return this;
    }

    public text(text: string | LabelFormatter): Label {
        this._text = text;
        return this;
    }

    render(ctx: CanvasRenderingContext2D): void {
        ctx.font = this._fontSize + "px " + this._fontFamily;
        ctx.fillStyle = this._color;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";

        let text = typeof this._text === "string" ? this._text as string : (this._text as LabelFormatter)(this);

        if (this._alignX !== null) {
            let metrics = ctx.measureText(text);
            this._x = this.engine.canvas.width * this._alignX - metrics.width * this._alignX;
        }
        if (this._alignY !== null) {
            this._y = this.engine.canvas.height * this._alignY - this._fontSize * this._alignY;
        }
        ctx.fillText(text, this._x, this._y);
    }
}

class FpsCounter extends Label {

    process(delta: number): void {
        this.text((1000 / delta).toFixed(2) + " FPS");
    }
}

