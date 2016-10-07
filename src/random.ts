
namespace random {

    export function biRange(min: number, max: number, val: number = Math.random()) {
        val = val * 2 - 1;
        return val * (max - min) + (val < 0 ? -1 : 1) * min;
    }

    export function range(min: number, max: number, val: number = Math.random()): number {
        return val * (max - min) + min;
    }

    export function bool(val: number = Math.random()) {
        return val < 0.5;
    }

}