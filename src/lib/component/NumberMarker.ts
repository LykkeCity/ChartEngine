/**
 * NumberMarker class.
 */
import { NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class NumberMarker extends VisualComponent {

    private axis: NumberAxis;

    constructor(
        private area: Area,
        offset: Point, size: ISize, axis: NumberAxis) {
        super(offset, size);
        this.axis = axis;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            const mouseY = context.mousePosition.y;

            if (mouseY > 0 && mouseY < this.size.height) {

                //const canvas = context.getCanvas(this.target);
                const render = renderLocator.getMarkRender('number');
                const num = this.axis.toValue(mouseY);
                render.render(this.area.frontCanvas, num, { x: 0, y: mouseY }, this.size);
            }
        }
    }
}
