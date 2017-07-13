/**
 * PriceMarker class.
 */
import { PriceAxis } from '../axes/index';
import { IVisualComponent, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { IPoint, ISize } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class PriceMarker extends VisualComponent {

    private readonly area: Area;
    private readonly axis: PriceAxis;
    private readonly settings: IChartingSettings;
    private readonly getter: (ctx: VisualContext, size: ISize) => number|undefined;

    constructor(area: Area, offset: IPoint, size: ISize, axis: PriceAxis, settings: IChartingSettings, getter: (ctx: VisualContext, size: ISize) => number|undefined) {
        super(offset, size);
        this.area = area;
        this.axis = axis;
        this.settings = settings;
        this.getter = getter;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        const value = this.getter(context, this.size);
        if (value) {
            const render = <IMarkRender<number>>renderLocator.getMarkRender('number');
            const y = this.axis.toX(value);
            render.render(this.area.frontCanvas, value, { x: 0, y: y }, this.size, this.settings.precision());
        }
    }
}
