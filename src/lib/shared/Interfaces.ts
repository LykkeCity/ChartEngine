/**
 * Commonly used interfaces, that can be used in other projects.
 */

export interface IRange<T> {
    readonly start: T;
    readonly end: T;
}

export class Point {
    public readonly x: number;
    public readonly y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
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
