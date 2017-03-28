/**
 * Core interfaces.
 */
import { IRange } from '../shared/index';

export interface IAxis<T> {
    range: IRange<T>;
    interval: number;
    toX(value: T): number;
    toValue(x: number): T;
    getGrid(): T[];
    getValuesRange(fromX: number, toX: number): IRange<T> | undefined;
    move(direction: number): void;
    scale(direction: number): void;
}

export interface IPoint {
    readonly x: number;
    readonly y: number;
}

export interface IMouse {
    x: number;
    y: number;
    isDown: boolean;
    isEntered: boolean;
}

export interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
