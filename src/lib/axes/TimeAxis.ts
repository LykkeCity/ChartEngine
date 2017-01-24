/** 
 * TimeAxis class
 * 
 * @classdesc Represents a chart's axis of numbers
 */

import { ICanvas } from '../canvas/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange } from '../shared/index';
import { IAxis } from './IAxis';

export class TimeAxis extends VisualComponent implements IAxis<Date> {

    private _range: IRange<Date>;
    private _w: number;
    private _interval: number;

    constructor(
        private canvas: ICanvas,
        width: number,
        interval: number,         // Defines maximum zoom
        initialRange: IRange<Date>) {
            super();
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

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        const render = renderLocator.getAxesRender('date');

        render.renderDateAxis(this, this.canvas);
    }
}
