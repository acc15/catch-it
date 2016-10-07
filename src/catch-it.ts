

document.addEventListener("DOMContentLoaded", () => {

    let engine: Engine = new Engine(document.getElementById("catch-it") as HTMLCanvasElement);

    let hand = new Hand();
    let shitScene = new Scene();
    let score = new Label().text(() => "SCORE: " + scoreValue).align(0.99, 0.01).color("white");
    let scoreValue = 0;
    let root = new Scene().
        add(new Sky()).
        add(new BirdSpawn(shitScene)).
        add(hand).
        add(shitScene).
        add(new RectCollisionDetector(hand, shitScene.getChildren() as PhysicalObject[], (p1, p2) => {
            scoreValue += 500;
            p2.markDead();
    }   )).
        add(score).
        add(new FpsCounter().align(0.01, 0.01).color("white"));

    document.addEventListener("mousemove", (event) => {
        hand.nextX = event.pageX - engine.canvas.offsetLeft;
    });

    engine.handler(root).start();

});