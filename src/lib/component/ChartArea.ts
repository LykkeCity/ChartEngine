/**
 * ChartArea class.
 */
import { CanvasWrapper } from '../canvas/index';

export class ChartArea {

    private _mainContext: CanvasWrapper;
    private _axisXContext: CanvasWrapper;
    private _axisYContext: CanvasWrapper;

    public get mainContext(): CanvasWrapper {
        return this._mainContext;
    }

    public get axisXContext(): CanvasWrapper {
        return this._axisXContext;
    }

    public get axisYContext(): CanvasWrapper {
        return this._axisYContext;
    }

    constructor(
        mainCanvas: HTMLCanvasElement,
        axisXCanvas: HTMLCanvasElement,
        axisYCanvas: HTMLCanvasElement) {

        this._mainContext = this.getContext(mainCanvas, mainCanvas.width, mainCanvas.height);
        this._axisXContext = this.getContext(axisXCanvas, axisXCanvas.width, axisXCanvas.height);
        this._axisYContext = this.getContext(axisYCanvas, axisYCanvas.width, axisYCanvas.height);
    }

    private getContext(el: HTMLCanvasElement, w: number, h: number): CanvasWrapper {
        let ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new CanvasWrapper(ctx, w, h);
    }
}
