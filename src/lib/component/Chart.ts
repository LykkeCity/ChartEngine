/**
 * Chart class.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { IRenderLocator, RenderType } from '../render/index';
import { IRange, Point } from '../shared/index';

export interface IChart {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export class Chart<T> extends VisualComponent implements IChart {
    constructor(
        private chartType: string,
        public offset: Point,
        private canvas: ICanvas,
        private dataSource: IDataSource<T>,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset);
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {
        return this.dataSource.getValuesRange(range, interval);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        // let renderType = '';

        // if (this.renderType === RenderType.Candlestick) {
        //     renderType = 'candle';
        // } else if (this.renderType === RenderType.Line) {
        //     renderType = 'line';
        // } else {
        //     throw new Error(`Unexpected render type ${ this.renderType }`);
        // }

        const render = renderLocator.getChartRender(this.dataSource.dataType, this.chartType);

        const dataIterator = this.dataSource.getData(this.timeAxis.range, this.timeAxis.interval);
        render.render(this.canvas, dataIterator, 0, 0, this.timeAxis, this.yAxis);

        super.render(context, renderLocator);
    }
}
