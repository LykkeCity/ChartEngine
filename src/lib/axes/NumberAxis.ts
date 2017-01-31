/**
 * NumberAxis class.
 */
import { VisualComponent, VisualContext } from '../core/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { NumberAutoGrid } from './AutoGrid';
import { IAxis } from './IAxis';

export class NumberAxis extends VisualComponent implements IAxis<number> {

    private _range: IRange<number>;
    private _interval: number;

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

    public getGrid(): number[] {
        const autoGrid = new NumberAutoGrid(this.size.height, this.interval, this.range);
        return autoGrid.getGrid();
    }

    public getValuesRange(fromX: number, toX: number): IRange<number> | undefined {
        if (fromX > 0 && toX > 0 && fromX < this.size.height && toX < this.size.height) {
            return {
                start: this.toValue(Math.max(fromX, toX)), // Y is inverted
                end: this.toValue(Math.min(fromX, toX)) };
        }
    }

    public toValue(x: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const max = Math.max(this.range.end, this.range.start);
        const d = x / this.size.height;
        return max - d * range;
    }

    public toX(value: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const max = Math.max(this.range.end, this.range.start);
        const d = (max - value) / range; // inverted Y
        return d * this.size.height;
    }

    public move(direction: number): void {
    }

    public scale(direction: number): void {
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = <IAxesRender<number>>renderLocator.getAxesRender('number');
            render.render(canvas, this, { x: 0, y: 0, w: this.size.width, h: this.size.height});
        }
        super.render(context, renderLocator);
    }
}
