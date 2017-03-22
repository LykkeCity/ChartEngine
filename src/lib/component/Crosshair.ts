/**
 * Crosshair class.
 */
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class Crosshair extends VisualComponent {

    constructor(
        private readonly area: Area,
        offset: Point, size: ISize) {
        super(offset, size);
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

            //const canvas = context.getCanvas(this.target);
            const render = renderLocator.getCrosshairRender();
            render.render(this.area.frontCanvas, { x: mouseX, y: mouseY }, this.size);
        }
    }
}
