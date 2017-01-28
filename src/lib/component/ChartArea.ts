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
        private h: number
        ) {
            const baseCanvas = document.createElement('canvas');
            baseCanvas.width = w;
            baseCanvas.height = h;
            baseCanvas.style.setProperty('left', '0');
            baseCanvas.style.setProperty('top', '0');
            baseCanvas.style.setProperty('z-index', '0');
            baseCanvas.style.setProperty('position', 'absolute');

            const frontCanvas = document.createElement('canvas');
            frontCanvas.width = w;
            frontCanvas.height = h;
            frontCanvas.style.setProperty('left', '0');
            frontCanvas.style.setProperty('top', '0');
            frontCanvas.style.setProperty('z-index', '1');
            frontCanvas.style.setProperty('position', 'absolute');

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

    public resize(w: number, h: number): void {
        this._mainContext.resize(w, h);
        this._frontContext.resize(w, h);
        this._baseCanvas.width = w;
        this._baseCanvas.height = h;
        this._frontCanvas.width = w;
        this._frontCanvas.height = h;
    }
}
