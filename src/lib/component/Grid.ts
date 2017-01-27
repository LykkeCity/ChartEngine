/**
 * Grid class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';

export class Grid extends VisualComponent {
    constructor(
        offset: Point,
        size: ISize,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset, size);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = renderLocator.getGridRender();
            render.render(canvas, { x: 0, y: 0, w: this.size.width, h: this.size.height }, this.timeAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }
}
