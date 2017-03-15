/**
 * ChartPopup class.
 */
import { IAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { Area } from '../layout/index';
import { IChartRender, IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class ChartPopup<T> extends VisualComponent {

    constructor(
        private chartType: string,
        private area: Area,
        offset: Point,
        size: ISize,
        private dataSource: IDataSource<T>,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>
        ) {
        super(offset, size);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        // only render on front
        if (!context.renderFront)  { return ; }
        if (!context.mousePosition) { return ; }

        const mouseX = context.mousePosition.x;
        const mouseY = context.mousePosition.y;

        if (mouseX > 0 && mouseX < this.size.width
            && mouseY > 0 && mouseY < this.size.height) {

            //const canvas = context.getCanvas(this.target);

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
                    const popupRender = renderLocator.getPopupRender<T>(this.dataSource.dataType);
                    popupRender.render(this.area.frontCanvas, item, { x: mouseX, y: mouseY }, this.size);
                }
            }
        }
    }
}
