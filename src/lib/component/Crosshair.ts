/**
 * Crosshair class.
 */
import { Events, IAxis, IMouse, ITimeAxis, IVisualComponent, MouseEventArgument, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IPoint, ISize } from '../shared/index';

export class Crosshair extends VisualComponent {

    private readonly axis: ITimeAxis;
    private mouse?: IMouse;

    constructor(
        private readonly area: Area,
        offset: IPoint, size: ISize, axis: ITimeAxis) {
        super(offset, size);
        this.axis = axis;

        Events.instance.mouseMove.on(this.onMouseMove);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (this.mouse) {
            // ... calculate mouse position related to this element
            const mouseX = this.mouse.pos.x;
            const mouseY = this.mouse.pos.y;

            const uid = this.axis.toValue(mouseX);
            if (uid !== undefined) {
                const newX = this.axis.toX(uid);
                const render = renderLocator.getCrosshairRender();
                render.render(this.area.frontCanvas, { x: newX, y: mouseY }, this.size);
            }
        }
    }

    private onMouseMove = (evt: MouseEventArgument) => {
        this.mouse = evt.mouse;
    }
}
