import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { VisualContext } from './VisualContext';
export declare abstract class VisualComponent {
    private _offset;
    private _size;
    protected children: VisualComponent[];
    offset: Point;
    readonly size: ISize;
    readonly target: string;
    constructor(offset?: Point, size?: ISize);
    addChild(child: VisualComponent): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
    forEach(delegate: {
        (component: VisualComponent): void;
    }): void;
}
