
interface PhysicalObject extends EngineObject {
    getBoundingBox(): Rect;
}

interface CollisionSolver {
    (p1: PhysicalObject, p2: PhysicalObject): void;
}

class RectCollisionDetector extends EngineObject {

    private p1: PhysicalObject;
    private p2: PhysicalObject[];
    private solver: CollisionSolver;

    constructor(p1: PhysicalObject, p2: PhysicalObject[], solver: CollisionSolver) {
        super();
        this.p1 = p1;
        this.p2 = p2;
        this.solver = solver;
    }

    process(delta: number): void {
        let rect1 = this.p1.getBoundingBox();
        for (let obj of this.p2) {
            let rect2 = obj.getBoundingBox();
            if (rect1.intersects(rect2)) {
                this.solver(this.p1, obj);
            }
        }
    }
}
