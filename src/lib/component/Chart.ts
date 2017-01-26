/**
 * Chart class.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator, RenderType } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { ChartPopup } from './ChartPopup';

export interface IChart {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export class Chart<T> extends VisualComponent implements IChart {
    private popup: ChartPopup<T>;

    constructor(
        private chartType: string,
        offset: Point,
        size: ISize,
        private dataSource: IDataSource<T>,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset, size);

            this.popup = new ChartPopup<T>(chartType, offset, size, dataSource, timeAxis, yAxis);
            this.addChild(this.popup);
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {
        return this.dataSource.getValuesRange(range, interval);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase) {
            const canvas = context.getCanvas(this.target);
            const render = renderLocator.getChartRender(this.dataSource.dataType, this.chartType);
            const dataIterator = this.dataSource.getData(this.timeAxis.range, this.timeAxis.interval);

            render.render(canvas, dataIterator, 0, 0, this.timeAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }
}
