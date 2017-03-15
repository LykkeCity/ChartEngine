/**
 * Chart class.
 */
import { IAxis } from '../axes/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { ChartArea } from '../layout/index';
import { IChartRender, IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { ChartPopup } from './ChartPopup';

export interface IChart {
    uid: string;
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export class Chart<T> extends VisualComponent implements IChart {
    private _uid: string;
    private area: ChartArea;
    private popup: ChartPopup<T>;

    constructor(
        uid: string,
        private chartType: string,
        chartArea: ChartArea,
        offset: Point,
        size: ISize,
        private dataSource: IDataSource<T>,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>) {
            super(offset, size);

            this._uid = uid;
            this.area = chartArea;
            this.popup = new ChartPopup<T>(chartType, this.area, { x: 0, y: 0 }, size, dataSource, timeAxis, yAxis);
            this.addChild(this.popup);
    }

    public get uid(): string {
        return this._uid;
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {
        return this.dataSource.getValuesRange(range, interval);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase) {
            //const canvas = context.getCanvas(this.target);
            const render = <IChartRender<T>>renderLocator.getChartRender(this.dataSource.dataType, this.chartType);
            const dataIterator = this.dataSource.getData(this.timeAxis.range, this.timeAxis.interval);

            render.render(this.area.baseCanvas, dataIterator,
                          { x: 0, y: 0, w: this.size.width, h: this.size.height },
                          this.timeAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }
}
