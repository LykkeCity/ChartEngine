/**
 * ChartArea class.
 */
import { CanvasWrapper } from '../canvas/index';

export class ChartArea {

    private _mainContext: CanvasWrapper;
    private _frontContext: CanvasWrapper;
    private _baseCanvas: HTMLCanvasElement;
    private _frontCanvas: HTMLCanvasElement

    public get mainContext(): CanvasWrapper {
        return this._mainContext;
    }

    public get frontContext(): CanvasWrapper {
        return this._frontContext;
    }

    public get baseCanvas(): HTMLCanvasElement {
        return this._baseCanvas;
    }

    public get frontCanvas(): HTMLCanvasElement {
        return this._frontCanvas;
    }

    public get width(): number {
        return this.w;
    }

    public get height(): number {
        return this.h;
    }

    constructor(
        private w: number,
        private h: number,
        baseCanvas: HTMLCanvasElement,
        frontCanvas: HTMLCanvasElement
        ) {
            this._baseCanvas = baseCanvas;
            this._frontCanvas = frontCanvas;
            this._mainContext = this.getContext(baseCanvas, baseCanvas.width, baseCanvas.height);
            this._frontContext = this.getContext(frontCanvas, frontCanvas.width, frontCanvas.height);
    }

    private getContext(el: HTMLCanvasElement, w: number, h: number): CanvasWrapper {
        const ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new CanvasWrapper(ctx, w, h);
    }
}
