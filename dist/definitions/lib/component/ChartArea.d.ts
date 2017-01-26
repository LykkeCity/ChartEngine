/**
 * ChartArea class.
 */
import { CanvasWrapper } from '../canvas/index';
export declare class ChartArea {
    private w;
    private h;
    private _mainContext;
    private _frontContext;
    private _baseCanvas;
    private _frontCanvas;
    readonly mainContext: CanvasWrapper;
    readonly frontContext: CanvasWrapper;
    readonly baseCanvas: HTMLCanvasElement;
    readonly frontCanvas: HTMLCanvasElement;
    readonly width: number;
    readonly height: number;
    constructor(w: number, h: number, baseCanvas: HTMLCanvasElement, frontCanvas: HTMLCanvasElement);
    private getContext(el, w, h);
}
