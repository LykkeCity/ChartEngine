/**
 * TimeMarker class.
 */
import { IAxis, ITimeAxis, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class TimeMarker extends VisualComponent {

    private readonly area: Area;
    private readonly axis: ITimeAxis;

    constructor(area: Area, offset: Point, size: ISize, axis: ITimeAxis) {
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
                const uid = this.axis.toValue(mouseX);
                if (uid) {
                    const newX = this.axis.toX(uid);
                    render.render(this.area.frontCanvas, uid.t, { x: newX, y: 0 }, this.size);
                }
            }
        }
    }
}
