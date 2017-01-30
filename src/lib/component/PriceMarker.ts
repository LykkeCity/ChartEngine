/**
 * PriceMarker class.
 */
import { PriceAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class PriceMarker extends VisualComponent {

    private axis: PriceAxis;

    public get target(): string {
        return 'front'; // 'base'
    }

    constructor(offset: Point, size: ISize, axis: PriceAxis) {
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

                const canvas = context.getCanvas(this.target);
                const render = renderLocator.getMarkRender('number');
                const num = this.axis.toValue(mouseY);
                render.render(canvas, num, { x: 0, y: mouseY }, this.size);
            }
        }
    }
}
