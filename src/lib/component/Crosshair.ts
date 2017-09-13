/**
 * Crosshair class.
 */
import { Events, IAxis, IMouse, ITimeAxis, MouseEventArgument, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IPoint, ISize, Point } from '../shared/index';

export class Crosshair extends VisualComponent {

    private readonly axis: ITimeAxis;
    private mouse?: Point;

    constructor(
        private readonly area: Area,
        offset: IPoint, size: ISize, axis: ITimeAxis) {
        super(offset, size);
        this.axis = axis;
    }

    public handleMouse(relX: number, relY: number) {
        if (this.mouse) {
            this.mouse.x = relX;
            this.mouse.y = relY;
        } else {
            this.mouse = new Point(relX, relY);
        }

        super.handleMouse(relX, relY);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (this.mouse) {
            // ... calculate mouse position related to this element
            const mouseX = this.mouse.x;
            const mouseY = this.mouse.y;

            const uid = this.axis.toValue(mouseX);
            if (uid !== undefined) {
                const newX = this.axis.toX(uid);
                const render = renderLocator.getCrosshairRender();
                render.render(this.area.frontCanvas, { x: newX, y: mouseY }, this.size);
            }
        }
    }
}
