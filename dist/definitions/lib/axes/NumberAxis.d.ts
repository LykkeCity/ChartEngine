/**
 * NumberAxis class.
 */
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IAxis } from './IAxis';
export declare class NumberAxis extends VisualComponent implements IAxis<number> {
    private _range;
    private _interval;
    constructor(offset: Point, size: ISize, interval: number, initialRange?: IRange<number>);
    range: IRange<number>;
    readonly interval: number;
    getGrid(): number[];
    getValuesRange(x1: number, x2: number): IRange<number> | undefined;
    toValue(x: number): number;
    toX(value: number): number;
    move(direction: number): void;
    scale(direction: number): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
