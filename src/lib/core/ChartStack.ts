/**
 * ChartStack class.
 */
import { Chart } from './Chart';
import { ChartArea } from './ChartArea';
import { IAxis, NumberAxis } from '../axes';
import { IDataSource } from '../data';
import { RenderType, AxisRenderer, LineChartRenderer, CandlestickChartRenderer } from '../render';

export class ChartStack {

    private charts: Chart[] = [];

    constructor(
        private area: ChartArea,
        private timeAxis: IAxis<Date>) {
    }

    public addChart<T>(dataSource: IDataSource<T>, renderType: RenderType): void {
        let newChart = new Chart(dataSource, renderType);
        this.charts.push(newChart);
    }

    public render() {

        this.area.mainContext.clear();
        this.area.axisXContext.clear();
        this.area.axisYContext.clear();

        let height = this.area.axisYContext.h;

        for(let chart of this.charts) {

            let data = chart.dataSource.getData(this.timeAxis.range);
            let yAxis = new NumberAxis(height, 1, { start: data.minOrdinateValue, end: data.maxOrdinateValue});

            if(chart.renderType === RenderType.Candlestick) {
                let candleRender = new CandlestickChartRenderer();
                candleRender.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else if(chart.renderType === RenderType.Line) {
                LineChartRenderer.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else{
                throw new Error(`Unexpected RenderType ${ chart.renderType }`);
            }
        }

        // render axis
        AxisRenderer.renderDateAxis(this.timeAxis, this.area.axisXContext);
    }
}
