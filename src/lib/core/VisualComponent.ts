/**
 * VisualComponent class.
 */
import { IPoint } from '../core/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point, Size } from '../shared/index';
import { VisualContext } from './VisualContext';

export abstract class VisualComponent { //implements IMouseHandler {

    protected _offset: Point;
    protected _size: Size;
    protected _children: VisualComponent[] = [];
    // protected childrenDesc: VisualComponentDesc[] = [];
    protected _visible: boolean;

    public get offset(): Point {
        return this._offset;
    }

    public set offset(value: Point) {
        this._offset = value;
    }

    public get size(): ISize {
        return this._size;
    }

    public get children(): VisualComponent[] {
        return this._children.slice();
    }

    public get visible(): boolean {
        return this._visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    constructor(offset?: Point, size?: ISize) {
        this._offset = offset ? offset : new Point(0, 0);
        this._size = size ? new Size(size.width, size.height) : new Size(0, 0);
    }

    protected addChild(child: VisualComponent) {
        this._children.push(child);
    }

    public removeChild(child: VisualComponent) {
        this._children = this._children.filter((value) => value !== child);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator): void {

        // Default behavior: just passing message to children
        for (const child of this._children) {

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
        // Default behavior: set size and pass message to children
        this._size = { width: w, height: h};

        for (const child of this._children) {
            child.resize(w, h);
        }
    }

    public forEach(delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void }, directOrder: boolean = true): boolean {
        return this.forEachAggregator(delegate, directOrder, new Point(0, 0));
    }

    private forEachAggregator(
        delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void },
        directOrder: boolean = true,
        initialOffset: Point): boolean {

        // 1. Execute for this component

        const offset = new Point(
            initialOffset.x + this.offset.x, // + child.offset.x,
            initialOffset.y + this.offset.y  // - child.offset.y
            );

        if (!delegate(this, offset)) {
            return false; // stop iterating
        }

        // 2. Iterating through children in direct or reverse order
        let index = directOrder ? 0 : this._children.length - 1;
        while ((directOrder && index < this._children.length - 1)
               || (!directOrder && index >= 0)) {
            if (!this._children[index].forEachAggregator(delegate, directOrder, offset)) {
                return false; // stop iterating through children
            }
            index = directOrder ? index + 1 : index - 1;
        }
        return true; // continute
    }
}
