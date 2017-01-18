/**
 * NumberAxis class.
 */
import { IRange } from '../shared';
import { IAxis } from './IAxis';

export class NumberAxis implements IAxis<number> {

    private _range: IRange<number>;
    private _w: number;
    private _interval: number;

    constructor(
        width: number,
        interval: number,         // Defines maximum zoom
        initialRange: IRange<number>) {
        this._w = width;
        this._interval = interval;
        this._range = initialRange;
    }

    public get range(): IRange<number> {
        return this._range;
    }

    public get interval(): number {
        return this._interval;
    }

    public get width(): number {
        return this._w;
    }

    toX(value: number): number {
        let range = Math.abs(this.range.end - this.range.start);
        let min = Math.min(this.range.end, this.range.start);
        let d = this.width / (range);
        return d * (value - min);
    }

    move(direction: number): void {
        direction = 0;
    }

    scale(direction: number): void {
        direction = 0;
    }
}
