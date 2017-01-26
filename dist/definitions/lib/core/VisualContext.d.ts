/**
 * VisualContext class.
 */
import { ICanvas } from '../canvas';
import { Point } from '../shared/index';
export declare class VisualContext {
    mousePosition?: Point;
    private baseCanvas;
    private frontCanvas;
    private _renderBase;
    private _renderFront;
    readonly renderBase: boolean;
    readonly renderFront: boolean;
    constructor(renderBase: boolean, renderFront: boolean, baseCanvas: ICanvas, frontCanvas: ICanvas, mousePosition?: Point);
    getCanvas(canvasId: string): ICanvas;
}
