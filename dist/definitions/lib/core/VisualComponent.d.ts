import { IRenderLocator } from '../render';
import { ISize, Point } from '../shared';
import { VisualContext } from './VisualContext';
export declare abstract class VisualComponent {
    protected offset: Point;
    protected size: ISize;
    protected children: VisualComponent[];
    constructor(offset?: Point, size?: ISize);
    addChild(child: VisualComponent): void;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}
