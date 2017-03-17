/**
 * Figures
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IPoint, ISize, PartialPoint, Point } from '../shared/index';

export abstract class FigureComponent extends VisualComponent {

}

export class LineFigureComponent extends FigureComponent {
    private a = new PartialPoint();
    private b = new PartialPoint();

    public get pointA(): PartialPoint {
        return this.a;
    }

    public get pointB(): PartialPoint {
        return this.b;
    }

    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>
        ) {
        super(offset, size);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.a.x && this.a.y && this.b.x && this.b.y) {
            const canvas = this.area.frontCanvas;

            canvas.setStrokeStyle('#FF0509');
            canvas.beginPath();

            canvas.moveTo(this.a.x, this.a.y);
            canvas.lineTo(this.b.x, this.b.y);

            canvas.stroke();
            canvas.closePath();
        }
    }
}
