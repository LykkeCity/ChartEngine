/**
 * Area class
 */
import { CanvasWrapper } from '../canvas/index';
import { IPoint } from '../core/index';
import { IEvent, ISize } from '../shared/index';
import { SizeChangedArgument, SizeChangedEvent } from './SizeChangedEvent';

export class Area {
    protected _offset: IPoint;
    protected _size: ISize;

    protected _baseCanvas: CanvasWrapper;
    protected _frontCanvas: CanvasWrapper;
    protected _baseCanvasEl: HTMLCanvasElement;
    protected _frontCanvasEl: HTMLCanvasElement;

    protected sizeChangedEvent= new SizeChangedEvent();

    public get sizeChanged(): IEvent<SizeChangedArgument> {
        return this.sizeChangedEvent;
    }

    protected constructor(
        offset: IPoint,
        size: ISize
    ) {
        this._offset = offset;
        this._size = size;
    }

    public get baseCanvas(): CanvasWrapper {
        return this._baseCanvas;
    }

    public get frontCanvas(): CanvasWrapper {
        return this._frontCanvas;
    }

    public get offset(): IPoint {
        return this._offset;
    }

    public set offset(value: IPoint)  {
        this._offset = value;
    }

    public get size(): ISize {
        return this._size;
    }

    public clearBase() {
        this.baseCanvas.clear();
    }

    public clearFront() {
        this.frontCanvas.clear();
    }

    public resize(w: number, h: number) {
        const dpr = window.devicePixelRatio || 1;

        this._baseCanvasEl.width = w * dpr;
        this._baseCanvasEl.height = h * dpr;
        this._baseCanvasEl.style.setProperty('width', w + 'px');
        this._baseCanvasEl.style.setProperty('height', h + 'px');

        this._frontCanvasEl.width = w * dpr;
        this._frontCanvasEl.height = h * dpr;
        this._frontCanvasEl.style.setProperty('width', w + 'px');
        this._frontCanvasEl.style.setProperty('height', h + 'px');

        this._baseCanvas.resize(w, h);
        this._frontCanvas.resize(w, h);

        this._size = { width: w, height: h };

        this.sizeChangedEvent.trigger(new SizeChangedArgument(this._size));
    }

    protected appendCanvases(div: HTMLDivElement, w: number, h: number) {

        const dpr = window.devicePixelRatio || 1;

        const baseCanvas = document.createElement('canvas');
        baseCanvas.width = w * dpr;
        baseCanvas.height = h * dpr;
        baseCanvas.style.setProperty('width', w + 'px');
        baseCanvas.style.setProperty('height', h + 'px');
        baseCanvas.style.setProperty('left', '0');
        baseCanvas.style.setProperty('top', '0');
        baseCanvas.style.setProperty('z-index', '0');
        baseCanvas.style.setProperty('position', 'absolute');

        const frontCanvas = document.createElement('canvas');
        frontCanvas.width = w * dpr;
        frontCanvas.height = h * dpr;
        frontCanvas.style.setProperty('width', w + 'px');
        frontCanvas.style.setProperty('height', h + 'px');
        frontCanvas.style.setProperty('left', '0');
        frontCanvas.style.setProperty('top', '0');
        frontCanvas.style.setProperty('z-index', '1');
        frontCanvas.style.setProperty('position', 'absolute');

        this._baseCanvasEl = baseCanvas;
        this._frontCanvasEl = frontCanvas;
        this._baseCanvas = this.getContext(baseCanvas, w, h);
        this._frontCanvas = this.getContext(frontCanvas, w, h);

        div.appendChild(baseCanvas);
        div.appendChild(frontCanvas);
    }

    private getContext(el: HTMLCanvasElement, w: number, h: number): CanvasWrapper {
        const ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new CanvasWrapper(ctx, w, h);
    }
}
