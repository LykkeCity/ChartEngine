/**
 * VisualContext class.
 */
import { ICanvas } from '../canvas';
import { Point } from '../shared/index';

export class VisualContext {
    public mousePosition?: Point;
    private baseCanvas: ICanvas;
    private frontCanvas: ICanvas;

    private _renderBase: boolean;
    private _renderFront: boolean;

    public get renderBase(): boolean {
        return this._renderBase;
    }

    public get renderFront(): boolean {
        return this._renderFront;
    }

    constructor(
        renderBase: boolean,
        renderFront: boolean,
        baseCanvas: ICanvas,
        frontCanvas: ICanvas,
        mousePosition?: Point) {
            this._renderBase = renderBase;
            this._renderFront = renderFront;
            this.baseCanvas = baseCanvas;
            this.frontCanvas = frontCanvas;
            this.mousePosition = mousePosition;
    }

    public getCanvas(canvasId: string) : ICanvas {
        switch (canvasId) {
            case 'base': return this.baseCanvas;
            case 'front': return this.frontCanvas;
            default: throw new Error('Unexpected canvasId ' + canvasId);
        }
    }
}
