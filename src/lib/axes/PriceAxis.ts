/**
 * PriceAxis class.
 */
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IAxis } from './IAxis';

export class PriceAxis extends VisualComponent implements IAxis<number> {

    private _range: IRange<number>;
    private _interval: number;
    //private marker: PriceMarker;

    constructor(
        offset: Point,
        size: ISize,
        interval: number,         // Defines maximum zoom
        initialRange?: IRange<number>) {
            super(offset, size);
            this._interval = interval;
            this._range = initialRange ? initialRange : {start: 0, end: 0};
    }

    public get range(): IRange<number> {
        return this._range;
    }

    public set range(newRange: IRange<number>) {
        this._range = newRange;
    }

    public get interval(): number {
        return this._interval;
    }

    public getValuesRange(x1: number, x2: number): IRange<number> | undefined {
        if (x1 > 0 && x2 > 0 && x1 < this.size.height && x2 < this.size.height) {
            return {
                start: this.toValue(Math.min(x1, x2)),
                end: this.toValue(Math.max(x1, x2)) };
        }
    }

    public toValue(x: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const base = Math.min(this.range.end, this.range.start);
        const d = x / this.size.height;
        return d * range + base;
    }

    public toX(value: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const base = Math.min(this.range.end, this.range.start);
        const d = (value - base) / range;
        return d * this.size.height;
    }

    public move(direction: number): void {
    }

    public scale(direction: number): void {
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = renderLocator.getAxesRender('price');
            render.render(canvas, this, { x: 0, y: 0 }, this.size);
        }
        super.render(context, renderLocator);
    }
}
