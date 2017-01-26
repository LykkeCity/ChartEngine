/** 
 * TimeAxis class
 * 
 * @classdesc Represents a chart's axis of numbers
 */

import { ICanvas } from '../canvas/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IAxis } from './IAxis';

export class TimeAxis extends VisualComponent implements IAxis<Date> {

    private _range: IRange<Date>;
    private _interval: number;

    constructor(
        offset: Point,
        size: ISize,
        interval: number,         // Defines maximum zoom
        initialRange: IRange<Date>) {
            super(offset, size);
            this._interval = interval;
            this._range = initialRange;
    }

    public get range(): IRange<Date> {
        return this._range;
    }

    public get interval(): number {
        return this._interval;
    }

    public getValuesRange(x1: number, x2: number): IRange<Date> | undefined {
        if (x1 > 0 && x2 > 0 && x1 < this.size.width && x2 < this.size.width) {
            return {
                start: this.toValue(Math.min(x1, x2)),
                end: this.toValue(Math.max(x1, x2)) };
        }
    }

    public toValue(x: number): Date {
        const range = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        const base = Math.min(this.range.end.getTime(), this.range.start.getTime());
        const d = x / this.size.width;
        return new Date(d * range + base);
    }

    public toX(value: Date): number {
        if (value < this.range.start || value > this.range.end) {
            throw new Error(`Date ${value} is out of range.`);
        }
        const range = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        const base = Math.min(this.range.end.getTime(), this.range.start.getTime());
        const toDate = value.getTime() - base;
        return (toDate / range) * this.size.width;
    }

    public move(direction: number): void {
        //direction = Math.round(direction);

        if (direction == 0) {
            return;
        }

        let curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods

        let shiftInMs = direction * curRangeInMs / this.size.width;

        this._range = {
            start: new Date(this.range.start.getTime() - shiftInMs),
            end: new Date(this.range.end.getTime() - shiftInMs)
        };
    }

    public scale(direction: number): void {
        let curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        let newRange = 0;

        // Move date to the specified direction
        if (direction > 0) { // zooming in
            newRange = curRangeInMs * 0.9;

            if (newRange / this.interval < 10) {
                newRange = this.interval * 10;
            }
        } else if (direction < 0) { // zooming out
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
        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = renderLocator.getAxesRender('date');
            render.render(canvas, this, this.offset, this.size);
        }
        super.render(context, renderLocator);
    }
}
