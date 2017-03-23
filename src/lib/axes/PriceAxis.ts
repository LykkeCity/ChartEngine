/**
 * PriceAxis class.
 */
import { IAxis } from '../core/index';
import { IRange } from '../shared/index';
import { NumberAutoGrid } from './AutoGrid';

export class PriceAxis implements IAxis<number> {

    private _range: IRange<number>;
    private _interval: number;
    private _length: number;

    constructor(
        length: number,
        interval: number, // defines maximum zoom
        initialRange?: IRange<number>) {
            this._length = length;
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

    public set length(value: number) {
        this._length = value;
    }

    public getGrid(): number[] {
        const autoGrid = new NumberAutoGrid(this._length, this.interval, this.range);
        return autoGrid.getGrid();
    }

    public getValuesRange(fromX: number, toX: number): IRange<number> | undefined {
        if (fromX > 0 && toX > 0 && fromX < this._length && toX < this._length) {
            return {
                start: this.toValue(Math.max(fromX, toX)),
                end: this.toValue(Math.min(fromX, toX)) };
        }
    }

    public toValue(x: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const max = Math.max(this.range.end, this.range.start);
        const d = x / this._length;
        return max - d * range;
    }

    public toX(value: number): number {
        const range = Math.abs(this.range.end - this.range.start);
        const max = Math.max(this.range.end, this.range.start);
        const d = (max - value) / range; // inverted Y
        return d * this._length;
    }

    public move(direction: number): void {
    }

    public scale(direction: number): void {
    }
}
