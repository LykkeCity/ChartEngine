/**
 * ChartArea class.
 */
import { CanvasWrapper } from '../canvas';
export declare class ChartArea {
    private _mainContext;
    private _axisXContext;
    private _axisYContext;
    readonly mainContext: CanvasWrapper;
    readonly axisXContext: CanvasWrapper;
    readonly axisYContext: CanvasWrapper;
    constructor(mainCanvas: HTMLCanvasElement, axisXCanvas: HTMLCanvasElement, axisYCanvas: HTMLCanvasElement);
    private getContext(el, w, h);
}
