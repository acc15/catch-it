
class Point {

    static ZERO: Point = new Point(0, 0);

    public x: number;
    public y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    add(other: Point): Point {
        this.x += other.x;
        this.y += other.y;
        return this;
    }
}

class Dimension {

    public width: number;
    public height: number;

    constructor(width: number, height: number) {
        this.width = width;
        this.height = height;
    }
}

class Rect {

    public x: number;
    public y: number;
    public width: number;
    public height: number;

    constructor(x: number, y: number, width: number, height: number) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    intersects(other: Rect): boolean {
        return Rect.axisIntersects(this.x, this.width, other.x, other.width) &&
                Rect.axisIntersects(this.y, this.height, other.y, other.height);
    }

    private static axisIntersects(v1: number, l1: number, v2: number, l2: number) {
        return Math.max(v1 + l1, v2 + l2) - Math.min(v1, v2) < l1 + l2;
    }

}