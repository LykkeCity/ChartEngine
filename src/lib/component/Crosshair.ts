/**
 * Crosshair class.
 */
import { IAxis, NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class Crosshair extends VisualComponent {

    public get target(): string {
        return 'front'; // 'base'
    }

    constructor(offset: Point, size: ISize) {
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

            const canvas = context.getCanvas(this.target);
            const render = renderLocator.getCrosshairRender();
            render.render(canvas, { x: mouseX, y: mouseY }, this.size);
        }
    }
}
