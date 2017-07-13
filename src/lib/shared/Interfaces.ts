/**
 * Commonly used interfaces, that can be used in other projects.
 */

export interface IRange<T> {
    readonly start: T;
    readonly end: T;
}

export interface IPoint {
    readonly x: number;
    readonly y: number;
}

export class Point {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ? x : 0;
        this.y = y ? y : 0;
    }

    /**
     * Returns new point which is a sum of this and other point. Original point is not changed.
     * @param p
     */
    public add(p: IPoint): Point {
        return new Point(this.x + p.x, this.y + p.y);
    }

    /**
     * Returns new point which is difference b/w this and other point. Original point is not changed.
     * @param p
     */
    public sub(p: IPoint): Point {
        return new Point(this.x - p.x, this.y - p.y);
    }
}

export class PartialPoint {
    public x?: number;
    public y?: number;
}

export interface ISize {
    readonly width: number;
    readonly height: number;
}

export class Size {
    public width: number = 0;
    public height: number = 0;

    constructor(w?: number, h?: number) {
        this.width = w ? w : 0;
        this.height = h ? h : 0;
    }
}

export interface IRect {
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
}

export interface IHashTable<T> {
    [key: string]: T;
}

export interface IDisposable {
    dispose(): void;
}

export class IdValue {
    constructor(
        public id: string,
        public value: string) {
        }
}

export interface Iterator<T> {
    reset(): void;
    moveNext(): boolean;
    current: T;
}
