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
            const mouseX = context.mousePosition.x; // - this.offset.x;
            const mouseY = context.mousePosition.y; // - this.offset.y;

            // TODO: move to specific renderer
            const canvas = context.getCanvas(this.target);
            canvas.setStrokeStyle('black');
            canvas.beginPath();
            const text = `[${mouseX} ${mouseY}]`;
            //let w = canvas.measureText(text).width;
            canvas.strokeText(text, 0, 50);
            canvas.stroke();
            canvas.closePath();

            // Draw crosshair
            //
            if (mouseX > 0 && mouseX < this.size.width) {
                // draw vertical line
                canvas.beginPath();
                canvas.moveTo(mouseX, 0);
                canvas.lineTo(mouseX, this.size.height);
                canvas.stroke();
                canvas.closePath();
            }
            if (mouseY > 0 && mouseY < this.size.height) {
                // draw horizontal line
                canvas.beginPath();
                canvas.moveTo(0, mouseY);
                canvas.lineTo(this.size.width, mouseY);
                canvas.stroke();
                canvas.closePath();
            }
        }
    }
}
