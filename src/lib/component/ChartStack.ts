/**
 * ChartStack class.
 */
import { IAxis, NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator, RenderType } from '../render/index';
import { ISize, Point } from '../shared/index';
import { Chart, IChart } from './Chart';
import { Crosshair } from './Crosshair';
import { Grid } from './Grid';

export class ChartStack extends VisualComponent {

    private charts: IChart[] = [];
    private crosshair: Crosshair;

    constructor(
        offset: Point,
        size: ISize,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset, size);

            // create crosshair
            this.crosshair = new Crosshair({x: 0, y: 0}, { width: size.width, height: size.height });
            this.addChild(this.crosshair);

            // add grid
            const grid = new Grid({x: 0, y: 0}, { width: size.width, height: size.height }, timeAxis, yAxis);
            this.addChild(grid);
    }

    public addChart<T>(chartType: string, dataSource: IDataSource<T>): void {
        const newChart = new Chart(chartType,
                                   new Point(this.offset.x, this.offset.y),
                                   { width: this.size.width, height: this.size.height },
                                   dataSource, this.timeAxis, this.yAxis);
        this.charts.push(newChart);
        this.addChild(newChart);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase)  {
            const canvas = context.getCanvas(this.target);

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
        }

        super.render(context, renderLocator);

        // // 2. Render charts
        // for (const chart of this.charts) {
        //     chart.render(context, renderLocator);
        // }

        // // 3. Render additional objects
        // //
        // this.crosshair.render(context, renderLocator);
    }
}
