/**
 * ChartPopup class.
 */
import { IAxis, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class ChartPopup<T> extends VisualComponent {

    private _visible = false;
    private _item?: T;

    public get visible() {
        return this._visible;
    }

    public set visible(value: boolean) {
        this._visible = value;
    }

    public get item(): T | undefined {
        return this._item;
    }

    public set item(value: T | undefined) {
        this._item = value;
    }

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
        if (!context.renderFront || !context.mousePosition || !this._visible) {
            return;
        }
        const mouseX = context.mousePosition.x;
        const mouseY = context.mousePosition.y;

        if (mouseX > 0 && mouseX < this.size.width
            && mouseY > 0 && mouseY < this.size.height) {

            if (this._item) {
                const popupRender = renderLocator.getPopupRender<T>(this.dataSource.dataType);
                popupRender.render(this.area.frontCanvas, this._item, { x: mouseX, y: mouseY }, this.size);
            }
        }
    }
}
