/**
 * NumberMarker class.
 */
import { IAxis, NumberAxis, PriceAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class NumberMarker extends VisualComponent {

    private axis: NumberAxis;

    public get target(): string {
        return 'front'; // 'base'
    }

    constructor(offset: Point, size: ISize, axis: NumberAxis) {
        super(offset, size);
        this.axis = axis;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            const mouseX = context.mousePosition.x;
            const mouseY = context.mousePosition.y;

            if (mouseY > 0 && mouseY < this.size.height) {

                const canvas = context.getCanvas(this.target);

                // TODO: move to specific renderer
                canvas.setStrokeStyle('black');
                canvas.beginPath();

                const text = this.axis.toValue(mouseY).toString();

                canvas.strokeText(text, 0, mouseY);
                canvas.stroke();
                canvas.closePath();
            }
        }
    }
}
