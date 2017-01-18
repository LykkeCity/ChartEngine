/**
 * TimeAxis class
 *
 * @classdesc Represents a chart's axis of numbers
 */
import { IRange } from '../shared';
import { IAxis } from './IAxis';
export declare class TimeAxis implements IAxis<Date> {
    private _range;
    private _w;
    private _interval;
    constructor(width: number, interval: number, initialRange: IRange<Date>);
    readonly range: IRange<Date>;
    readonly interval: number;
    readonly width: number;
    toX(value: Date): number;
    move(direction: number): void;
    scale(direction: number): void;
}
