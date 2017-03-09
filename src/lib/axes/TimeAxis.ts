/** 
 * TimeAxis class
 * 
 * @classdesc Represents a chart's axis of numbers
 */
import { VisualComponent, VisualContext } from '../core/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { TimeAutoGrid } from './AutoGrid';
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

    public set interval(value: number) {
        //const prevInterval = this._interval;
        this._interval = value;

        // Adjast scale according to the new interval if needed
        // Multiplying by 1 will do the work
        //this.scale(this._interval - prevInterval);
        this.scaleByMultiplier(1.0);
    }

    public contains(date: Date): boolean {
        const t = date.getTime();
        return this._range.start.getTime() <= t && t <= this._range.end.getTime();
    }

    public getGrid(): Date[] {
        const autoGrid = new TimeAutoGrid(this.size.width, this.interval, this.range);
        return autoGrid.getGrid();
    }

    public getValuesRange(fromX: number, toX: number): IRange<Date> | undefined {
        if (fromX > 0 && toX > 0 && fromX < this.size.width && toX < this.size.width) {
            return {
                start: this.toValue(Math.min(fromX, toX)),
                end: this.toValue(Math.max(fromX, toX)) };
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
        if (direction === 0) {
            return;
        }

        const curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods

        const shiftInMs = direction * curRangeInMs / this.size.width;

        this._range = {
            start: new Date(this.range.start.getTime() - shiftInMs),
            end: new Date(this.range.end.getTime() - shiftInMs)
        };
    }

    public moveTo(date: Date): void {
        const t = date.getTime();
        const end = this._range.end.getTime();
        const start = this._range.start.getTime();
        let diff = 0;

        if (t > end) {
            diff = (t - end) + this._interval;
        } else if (t < start) {
            diff = (t - start) - this._interval;
        }

        if (diff !== 0) {
            this._range = { start: new Date(start + diff), end: new Date(end  + diff) };
        }
    }

    public scale(direction: number): void {
        if (direction > 0) {                // zooming in
            this.scaleByMultiplier(0.9);
        } else if (direction < 0) {         // zooming out
            this.scaleByMultiplier(1.1);
        }
    }

    private scaleByMultiplier(multiplier: number) : void {
        const curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        let newRange = curRangeInMs * multiplier;

        // Cut range to min/max values
        if (newRange / this.interval < 10) {
            newRange = this.interval * 10;
        } else if (newRange / this.interval > 1000) {
            newRange = this.interval * 1000;
        }

        this._range = {
            start: new Date(this.range.end.getTime() - newRange),
            end: this.range.end
        };
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = <IAxesRender<Date>>renderLocator.getAxesRender('date');
            render.render(canvas, this, { x: 0, y: 0, w: this.size.width, h: this.size.height});
        }
        super.render(context, renderLocator);
    }
}
