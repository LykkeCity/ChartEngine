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
export declare class TimeAxis extends VisualComponent implements IAxis<Date> {
    private canvas;
    private _range;
    private _w;
    private _interval;
    constructor(canvas: ICanvas, width: number, interval: number, initialRange: IRange<Date>);
    readonly range: IRange<Date>;
    readonly interval: number;
    readonly width: number;
    toX(value: Date): number;
    move(direction: number): void;
    scale(direction: number): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
