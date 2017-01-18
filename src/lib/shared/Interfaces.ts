/**
 * Commonly used interfaces, that can be used in other projects.
 */

export interface IRange<T> {
    readonly start: T;
    readonly end: T;
}

export interface ISize {
    readonly width: number,
    readonly height: number
}

export interface IRect {
    readonly x: number,
    readonly y: number
    readonly w: number,
    readonly h: number
}

export interface IHashTable<T> {
    [key: string]: T;
}
