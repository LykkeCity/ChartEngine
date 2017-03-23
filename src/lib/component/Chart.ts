/**
 * Chart class.
 */
import { IAxis, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { ChartArea } from '../layout/index';
import { IChartRender, IRenderLocator, RenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { ChartPopup } from './ChartPopup';
import { IHoverable } from './Interfaces';

export interface IChart {
    uid: string;
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export class Chart<T> extends VisualComponent implements IChart, IHoverable {
    private readonly _uid: string;
    private readonly area: ChartArea;
    private readonly popup: ChartPopup<T>;

    constructor(
        uid: string,
        private readonly chartType: string,
        chartArea: ChartArea,
        offset: Point,
        size: ISize,
        private readonly dataSource: IDataSource<T>,
        private readonly timeAxis: IAxis<Date>,
        private readonly yAxis: IAxis<number>) {
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

    public isHit(mouseX: number, mouseY: number): boolean {

        if (mouseX > 0 && mouseX < this.size.width
            && mouseY > 0 && mouseY < this.size.height) {

            const renderLocator = RenderLocator.Instance;
            // 1. Get approximate range
            // 2. Get data in that range            
            // 3. Test hit area
            //
            const dateRange = this.timeAxis.getValuesRange(mouseX - 10, mouseX + 10);
            if (dateRange && dateRange.start && dateRange.end) {
                const dataIterator = this.dataSource.getData(dateRange, this.timeAxis.interval);
                const dataRender = <IChartRender<T>>renderLocator.getChartRender(this.dataSource.dataType, this.chartType);
                const item = dataRender.testHitArea(
                    { x: mouseX, y: mouseY },
                    dataIterator,
                    {x: 0, y: 0, w: this.size.width, h: this.size.height },
                    this.timeAxis,
                    this.yAxis);

                if (item) {
                    this.popup.item = item;
                    return true;
                }
            }
        }
        return false;
    }

    public setPopupVisibility(visible: boolean): void {
        this.popup.visible = visible;
    }
}
