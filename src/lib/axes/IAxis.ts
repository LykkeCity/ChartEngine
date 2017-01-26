/**
 * IAxis interface.
 */
import { IRange, ISize } from '../shared/index';

export interface IAxis<T> {
    range: IRange<T>;
    interval: number;
    toX(value: T): number;
    toValue(x: number): T;
    getValuesRange(x1: number, x2: number): IRange<T> | undefined;
    move(direction: number): void;
    scale(direction: number): void;
}
