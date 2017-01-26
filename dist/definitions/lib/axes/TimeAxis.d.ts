import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IAxis } from './IAxis';
export declare class TimeAxis extends VisualComponent implements IAxis<Date> {
    private _range;
    private _interval;
    constructor(offset: Point, size: ISize, interval: number, initialRange: IRange<Date>);
    readonly range: IRange<Date>;
    readonly interval: number;
    getValuesRange(x1: number, x2: number): IRange<Date> | undefined;
    toValue(x: number): Date;
    toX(value: Date): number;
    move(direction: number): void;
    scale(direction: number): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
