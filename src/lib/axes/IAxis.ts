/**
 * IAxis interface.
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
