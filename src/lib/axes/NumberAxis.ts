/**
 * NumberAxis class.
 */
import { VisualComponent, VisualContext } from '../core';
import { IRenderLocator } from '../render';
import { IRange } from '../shared';
import { IAxis } from './IAxis';

export class NumberAxis extends VisualComponent implements IAxis<number> {

    private _range: IRange<number>;
    private _w: number;
    private _interval: number;

    constructor(
        width: number,
        interval: number,         // Defines maximum zoom
        initialRange?: IRange<number>) {
            super();
            this._w = width;
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

    public get width(): number {
        return this._w;
    }

    public toX(value: number): number {
        let range = Math.abs(this.range.end - this.range.start);
        let min = Math.min(this.range.end, this.range.start);
        let d = this.width / (range);
        return d * (value - min);
    }

    public move(direction: number): void {
    }

    public scale(direction: number): void {
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        // const render = renderLocator.getAxesRender('date');

        // render.renderDateAxis(this, this.canvas);
    }    
}
