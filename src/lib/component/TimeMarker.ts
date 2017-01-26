/**
 * TimeMarker class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class TimeMarker extends VisualComponent {

    private axis: IAxis<Date>;

    public get target(): string {
        return 'front'; // 'base'
    }

    constructor(offset: Point, size: ISize, axis: IAxis<Date>) {
        super(offset, size);
        this.axis = axis;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            const mouseX = context.mousePosition.x;// - this.offset.x;
            const mouseY = context.mousePosition.y;// - this.offset.y;

            if (mouseX > 0 && mouseX < this.size.width) {

                const canvas = context.getCanvas(this.target);
                const render = renderLocator.getMarkRender('date');
                const date = this.axis.toValue(mouseX);
                render.render(canvas, date, { x: mouseX, y: 10 }, this.size);
            }
        }
    }
}
