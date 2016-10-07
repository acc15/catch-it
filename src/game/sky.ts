class Sky extends EngineObject {

    render(ctx: CanvasRenderingContext2D): void {
        let gradient = ctx.createLinearGradient(0, 0, 0, this.engine.canvas.height);
        gradient.addColorStop(1, "#eeeeff");
        gradient.addColorStop(0.25, 'rgba(0,132,255,1)');
        gradient.addColorStop(0, 'rgba(0,60,181,1)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.engine.canvas.width, this.engine.canvas.height);
    }
}

