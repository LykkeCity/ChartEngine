/**
 * VisualComponent class.
 */
import { IRenderLocator } from '../render/index';
import { IPoint, ISize, Point, Size } from '../shared/index';
import { UidUtils } from '../utils/index';
import { CObject } from './CObject';
import { VisualContext } from './VisualContext';

export abstract class VisualComponent extends CObject {
    protected _offset: Point;
    protected _size: Size;
    protected _children: VisualComponent[] = [];
    protected _visible = true;

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

    constructor(offset?: IPoint, size?: ISize, uid?: string, name?: string) {
        super(uid || UidUtils.NEWUID(), name);
        this._offset = offset ? new Point(offset.x, offset.y) : new Point(0, 0);
        this._size = size ? new Size(size.width, size.height) : new Size(0, 0);
    }

    protected addChild(child: VisualComponent) {
        this._children.push(child);
    }

    public removeChild(child: VisualComponent) {
        this._children = this._children.filter(value => value !== child);
    }

    public handleMouse(relX: number, relY: number) {
        // Default behavior: just passing message to children
        for (const child of this._children) {
            child.handleMouse(relX - child.offset.x, relY - child.offset.y);
        }
    }

    public render(context: VisualContext, renderLocator: IRenderLocator): void {
        // Default behavior: just passing message to children
        for (const child of this._children) {
            child.render(context, renderLocator);
        }
    }

    public resize(w: number, h: number): void {
        // Default behavior: set size and pass message to children
        this._size = { width: w, height: h };

        for (const child of this._children) {
            child.resize(w, h);
        }
    }

    public forEach(delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void },
                   childrenFirst: boolean = false,
                   directOrder: boolean = true): void {
        this.forEachAggregator(delegate, childrenFirst, directOrder, new Point(0, 0));
    }

    private forEachAggregator(
        delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void },
        childrenFirst: boolean,
        directOrder: boolean,
        initialOffset: Point): boolean {

        // 1. Execute for this component
        //
        const offset = new Point(initialOffset.x + this.offset.x,
                                 initialOffset.y + this.offset.y);

        if (!childrenFirst && !delegate(this, offset)) {
            return false; // stop iterating
        }

        // 2. Iterating through children in direct or reverse order
        //
        let index = directOrder ? 0 : this._children.length - 1;
        while ((directOrder && index < this._children.length)
               || (!directOrder && index >= 0)) {
            if (!this._children[index].forEachAggregator(delegate, childrenFirst, directOrder, offset)) {
                return false; // stop iterating through children
            }
            index = directOrder ? index + 1 : index - 1;
        }

        if (childrenFirst && !delegate(this, offset)) {
            return false; // stop iterating
        }

        return true; // continue
    }
}
