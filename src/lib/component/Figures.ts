/**
 * Figures
 */
import { IAxis } from '../axes/index';
import { ChartPoint, IHoverable, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IPoint, ISize, PartialPoint, Point } from '../shared/index';

export abstract class FigureComponent extends VisualComponent {

}

export class PointFigureComponent extends FigureComponent implements IHoverable {
    private p = new ChartPoint();
    private isHovered = false;

    public get point(): ChartPoint {
        return this.p;
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

    public isHit(x: number, y: number): boolean {

        if (!this.p.t || !this.p.v) {
            return false;
        }

        const px = this.timeAxis.toX(this.p.t);
        const py = this.yAxis.toX(this.p.v);

        const diff = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
        return diff < 5;
    }

    public setPopupVisibility(visible: boolean): void {
        this.isHovered = visible;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.p.t && this.p.v) {
            const x = this.timeAxis.toX(this.p.t);
            const y = this.yAxis.toX(this.p.v);

            const canvas = this.area.frontCanvas;

            canvas.beginPath();
            canvas.arc(x, y, 3, 0, 2 * Math.PI, false);

            if (this.isHovered) {
                canvas.setFillStyle('#FFFFFF');
                canvas.setStrokeStyle('#000BEF');
                canvas.fill();
            } else {
                canvas.setStrokeStyle('#FF0509');
            }

            canvas.stroke();
            canvas.closePath();
        }
    }
}

export class LineFigureComponent extends FigureComponent implements IHoverable {
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private isHovered = false;

    public get pointA(): ChartPoint {
        return this.pa.point;
    }

    public get pointB(): ChartPoint {
        return this.pb.point;
    }

    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>
        ) {
        super(offset, size);

        this.pa = new PointFigureComponent(area, offset, size, timeAxis, yAxis);
        this.pb = new PointFigureComponent(area, offset, size, timeAxis, yAxis);

        this.addChild(this.pa);
        this.addChild(this.pb);
    }

    public isHit(x: number, y: number): boolean {

        if (!this.pa.point.t || !this.pa.point.v || !this.pb.point.t || !this.pb.point.v) {
            return false;
        }

        // TODO: Can be stored when coords are changed
        const ax = this.timeAxis.toX(this.pa.point.t);
        const bx = this.timeAxis.toX(this.pb.point.t);

        const ay = this.yAxis.toX(this.pa.point.v);
        const by = this.yAxis.toX(this.pb.point.v);

        const minx = Math.min(ax, bx);
        const maxx = Math.max(ax, bx);
        const miny = Math.min(ay, by);
        const maxy = Math.max(ay, by);

        // Check hitting the rectangle area around the line
        if (x > minx - 3 && x < maxx + 3 && y > miny - 3 && y < maxy + 3) {

        } else {
            return false;
        }

        // If very short line
        if (maxx - minx < 3 && maxy - miny < 3) {
            console.debug(`minx - x = ${minx - x}   miny - y = ${miny - y}`);
            if (Math.abs(minx - x) < 3 && Math.abs(miny - y) < 3) {
                return true;
            }
            return false;
        } else {
            const diff = (x - ax) / (bx - ax) - (y - ay) / (by - ay);
            console.debug(`diff = ${diff}`);
            return (Math.abs(diff) < 0.04);
        }
    }

    public setPopupVisibility(visible: boolean): void {
        this.isHovered = visible;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.pa.point.t && this.pa.point.v && this.pb.point.t && this.pb.point.v) {
            const ax = this.timeAxis.toX(this.pa.point.t);
            const ay = this.yAxis.toX(this.pa.point.v);

            const bx = this.timeAxis.toX(this.pb.point.t);
            const by = this.yAxis.toX(this.pb.point.v);

            const canvas = this.area.frontCanvas;

            if (this.isHovered) {
                canvas.setStrokeStyle('#000BEF');
            } else {
                canvas.setStrokeStyle('#FF0509');
            }

            canvas.beginPath();

            canvas.moveTo(ax, ay);
            canvas.lineTo(bx, by);

            canvas.stroke();
            canvas.closePath();
        }

        super.render(context, renderLocator);
    }
}
