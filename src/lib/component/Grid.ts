/**
 * Grid class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class Grid extends VisualComponent {
    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset, size);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase) {
            //const canvas = context.getCanvas(this.target);
            const render = renderLocator.getGridRender();
            render.render(this.area.baseCanvas, { x: 0, y: 0, w: this.size.width, h: this.size.height }, this.timeAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }
}
