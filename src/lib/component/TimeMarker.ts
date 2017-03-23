/**
 * TimeMarker class.
 */
import { IAxis, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class TimeMarker extends VisualComponent {

    private readonly area: Area;
    private readonly axis: IAxis<Date>;

    constructor(area: Area, offset: Point, size: ISize, axis: IAxis<Date>) {
        super(offset, size);
        this.area = area;
        this.axis = axis;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            const mouseX = context.mousePosition.x;

            if (mouseX > 0 && mouseX < this.size.width) {

                //const canvas = context.getCanvas(this.target);
                const render = renderLocator.getMarkRender('date');
                const date = this.axis.toValue(mouseX);
                render.render(this.area.frontCanvas, date, { x: mouseX, y: 0 }, this.size);
            }
        }
    }
}
