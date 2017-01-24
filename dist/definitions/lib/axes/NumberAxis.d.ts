/**
 * NumberAxis class.
 */
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange } from '../shared/index';
import { IAxis } from './IAxis';
export declare class NumberAxis extends VisualComponent implements IAxis<number> {
    private _range;
    private _w;
    private _interval;
    constructor(width: number, interval: number, initialRange?: IRange<number>);
    range: IRange<number>;
    readonly interval: number;
    readonly width: number;
    toX(value: number): number;
    move(direction: number): void;
    scale(direction: number): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
