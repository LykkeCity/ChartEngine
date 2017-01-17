/** 
 * TimeAxis class
 * 
 * @classdesc Represents a chart's axis of numbers
 */

import { IAxis } from 'core/Interfaces';
import { IRange } from 'shared/Interfaces';

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
    }

    scale(direction: number): void {
    }
}

export class TimeAxis implements IAxis<Date> {

    private _range: IRange<Date>;
    private _w: number;
    private _interval: number;

    constructor(
        width: number,
        interval: number,         // Defines maximum zoom
        initialRange: IRange<Date>) {
        this._w = width;
        this._interval = interval;
        this._range = initialRange;
    }

    public get range(): IRange<Date> {
        return this._range;
    }

    public get interval(): number {
        return this._interval;
    }

    public get width(): number {
        return this._w;
    }

    toX(value: Date): number {

        if (value < this.range.start || value > this.range.end) {
            throw new Error(`Date ${value} is out of range.`);
        }

        let total = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        let toDate = Math.abs(value.getTime() - this.range.start.getTime());
        let x = (toDate / total) * this.width;

        return x;
    }

    move(direction: number): void {
        //direction = Math.round(direction);

        if (direction == 0) {
            return;
        }

        let curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods

        let shiftInMs = direction * curRangeInMs / this.width;

        this._range = {
            start: new Date(this.range.start.getTime() - shiftInMs),
            end: new Date(this.range.end.getTime() - shiftInMs)
        };
    }

    scale(direction: number): void {
        let curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        let newRange = 0;

        // Move date to the specified direction
        if (direction > 0) { // zooming in
            newRange = curRangeInMs * 0.9;

            if (newRange / this.interval < 10) {
                newRange = this.interval * 10;
            }
        }
        else if (direction < 0) { // zooming out
            newRange = curRangeInMs * 1.1;

            if (newRange / this.interval > 1000) {
                newRange = this.interval * 1000;
            }
        }

        this._range = {
            start: new Date(this.range.end.getTime() - newRange),
            end: this.range.end
        };
    }
}