/**
 * IAxis interface.
 */
import { IRange } from '../shared';
export interface IAxis<T> {
    range: IRange<T>;
    width: number;
    interval: number;
    toX(value: T): number;
    move(direction: number): void;
    scale(direction: number): void;
}
