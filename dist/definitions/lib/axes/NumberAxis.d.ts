/**
 * NumberAxis class.
 */
import { IRange } from '../shared';
import { IAxis } from './IAxis';
export declare class NumberAxis implements IAxis<number> {
    private _range;
    private _w;
    private _interval;
    constructor(width: number, interval: number, initialRange: IRange<number>);
    readonly range: IRange<number>;
    readonly interval: number;
    readonly width: number;
    toX(value: number): number;
    move(direction: number): void;
    scale(direction: number): void;
}
