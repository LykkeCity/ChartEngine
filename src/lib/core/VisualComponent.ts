/**
 * VisualComponent class.
 */
import { IMouseHandler } from '../interaction';
import { IRenderLocator } from '../render';
import { ISize, Point } from '../shared';
import { VisualContext } from './VisualContext';

// export class VisualComponentDesc {
//     public offset: Point;
//     constructor(offset: Point) {
//         this.offset = offset;
//     }
// }

export abstract class VisualComponent { //implements IMouseHandler {

    protected offset: Point;
    protected size: ISize;
    protected children: VisualComponent[] = [];
    // protected childrenDesc: VisualComponentDesc[] = [];

    constructor(offset?: Point, size?: ISize) {
        this.offset = offset ? offset : new Point(0, 0);
        this.size = size ? size : {width: 0, height: 0};
    }

    public addChild(child: VisualComponent) {
        this.children.push(child);
        //this.childrenDesc.push(new VisualComponentDesc(offset));
    }

    public render(context: VisualContext, renderLocator: IRenderLocator): void {
        for (const child of this.children) {
            child.render(context, renderLocator);
        }
    }

    // public onMouseWheel(event: any): void {
    // }
    // public onMouseMove(event: any): void {
    // }
    // public onMouseEnter(event: any): void {
    // }
    // public onMouseLeave(event: any): void {
    // }
    // public onMouseUp(event: any): void {
    // }
    // public onMouseDown(event: any): void {
    // }
    // public onClick(event: any): void {
    // }
}
