/**
 * Crosshair class.
 */
import { IAxis, ITimeAxis, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class Crosshair extends VisualComponent {

    private readonly axis: ITimeAxis;

    constructor(
        private readonly area: Area,
        offset: Point, size: ISize, axis: ITimeAxis) {
        super(offset, size);
        this.axis = axis;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            // ... calculate mouse position related to this element
            const mouseX = context.mousePosition.x;
            const mouseY = context.mousePosition.y;

            const uid = this.axis.toValue(mouseX);
            if (uid !== undefined) {
                const newX = this.axis.toX(uid);
                const render = renderLocator.getCrosshairRender();
                render.render(this.area.frontCanvas, { x: newX, y: mouseY }, this.size);
            }
        }
    }
}
