/**
 * ChartStack class.
 */
import { IAxis, NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { AxisRenderer, CandlestickChartRenderer, IRenderLocator, LineChartRenderer, RenderType } from '../render/index';
import { Point } from '../shared/index';
import { Chart, IChart } from './Chart';
import { ChartArea } from './ChartArea';

export class ChartStack extends VisualComponent {

    private charts: IChart[] = [];
    private yAxis: NumberAxis;

    constructor(
        private area: ChartArea,
        offset: Point,
        private timeAxis: IAxis<Date>) {
            super(offset);

            // create initial Y axis
            this.yAxis = new NumberAxis(this.area.axisYContext.h, 1);
    }

    public addChart<T>(chartType: string, dataSource: IDataSource<T>): void {

        const newChart = new Chart(chartType,
            new Point(this.offset.x, this.offset.y),
            this.area.mainContext, dataSource, this.timeAxis, this.yAxis);
        this.charts.push(newChart);
        this.addChild(newChart);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        this.area.mainContext.clear();
        this.area.axisXContext.clear();
        this.area.axisYContext.clear();

        // 1. Update y axis before rendering charts
        //
        // TODO: Make DataSource.DefaultYRange or take last known data:
        const yRange = { start: Number.MAX_VALUE, end: Number.MIN_VALUE };
        for (const chart of this.charts) {
            const valuesRange = chart.getValuesRange(this.timeAxis.range, this.timeAxis.interval);

            if (valuesRange.end > yRange.end) {
                yRange.end = valuesRange.end;
            }
            if (valuesRange.start < yRange.start) {
                yRange.start = valuesRange.start;
            }
        }

        if (this.charts.length > 0) {
            this.yAxis.range = yRange;
        } else {
            this.yAxis.range = { start: 0, end: 100 }; // default values
        }

        // 2. Render charts
        super.render(context, renderLocator);

        // 3. Render additional objects
        //
        if (context.mousePosition) {

            // ... calculate mouse position related to this element
            const mouseX = context.mousePosition.x - this.offset.x;
            const mouseY = context.mousePosition.y - this.offset.y;

            // TODO: move to specific renderer
            const canvas = this.area.mainContext;
            canvas.setStrokeStyle('black');
            canvas.beginPath();
            let text = `[${mouseX} ${mouseY}]`;
            //let w = canvas.measureText(text).width;
            canvas.strokeText(text, 0, 50);
            canvas.stroke();
            canvas.closePath();

            // Draw crosshair
            //
            if (mouseX > 0 && mouseX < this.area.mainContext.w) {
                // draw vertical line
                canvas.beginPath();
                canvas.moveTo(mouseX, 0);
                canvas.lineTo(mouseX, this.area.mainContext.h);
                canvas.stroke();
                canvas.closePath();
            }
            if (mouseY > 0 && mouseY < this.area.mainContext.h) {
                // draw horizontal line
                canvas.beginPath();
                canvas.moveTo(0, mouseY);
                canvas.lineTo(this.area.mainContext.w, mouseY);
                canvas.stroke();
                canvas.closePath();
            }
        }
    }
}
