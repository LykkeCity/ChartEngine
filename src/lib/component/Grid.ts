/**
 * Grid class.
 */
import { IAxis, ITimeAxis, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class Grid extends VisualComponent {
    constructor(
        private readonly area: Area,
        offset: Point,
        size: ISize,
        private readonly timeAxis: ITimeAxis,
        private readonly yAxis: IAxis<number>) {
            super(offset, size);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase && this.visible) {
            //const canvas = context.getCanvas(this.target);
            const render = renderLocator.getGridRender();
            render.render(this.area.baseCanvas, { x: 0, y: 0, w: this.size.width, h: this.size.height }, this.timeAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }
}
