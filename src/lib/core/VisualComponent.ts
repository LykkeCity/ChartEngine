/**
 * VisualComponent class.
 */
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { VisualContext } from './VisualContext';

export abstract class VisualComponent { //implements IMouseHandler {

    protected _offset: Point;
    protected _size: ISize;
    protected children: VisualComponent[] = [];
    // protected childrenDesc: VisualComponentDesc[] = [];

    public get offset(): Point {
        return this._offset;
    }

    public set offset(value: Point) {
        this._offset = value;
    }

    public get size(): ISize {
        return this._size;
    }

    constructor(offset?: Point, size?: ISize) {
        this._offset = offset ? offset : new Point(0, 0);
        this._size = size ? size : {width: 0, height: 0};
    }

    protected addChild(child: VisualComponent) {
        this.children.push(child);
    }

    public removeChild(child: VisualComponent) {
        this.children = this.children.filter((value) => value !== child);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator): void {
        for (const child of this.children) {

            // convert mouse coords to relative coords
            const origMousePos = context.mousePosition;
            if (context.mousePosition) {
                context.mousePosition = new Point(
                    context.mousePosition.x - child.offset.x,
                    context.mousePosition.y - child.offset.y);
            }

            child.render(context, renderLocator);

            // restore mousePosition
            context.mousePosition = origMousePos;
        }
    }

    public resize(w: number, h: number): void {
        this._size = { width: w, height: h};
        for (const child of this.children) {
            child.resize(w, h);
        }
    }

    public forEach(delegate: {(component: VisualComponent): void }) {
        for (const child of this.children) {
            delegate(child);
            child.forEach(delegate);
        }
    }
}
