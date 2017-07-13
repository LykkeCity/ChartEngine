/**
 * NumberMarker class.
 */
import { NumberAxis } from '../axes/index';
import { IValueCoordConverter, IVisualComponent, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { IPoint, ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class NumberMarker extends VisualComponent {

    private readonly yaxis: IValueCoordConverter<number>;
    private readonly settings: IChartingSettings;
    private readonly getter: (ctx: VisualContext, size: ISize) => number|undefined;

    constructor(
        private readonly area: Area,
        offset: IPoint, size: ISize, yaxis: IValueCoordConverter<number>, settings: IChartingSettings, getter: (ctx: VisualContext, size: ISize) => number|undefined ) {
        super(offset, size);
        this.yaxis = yaxis;
        this.settings = settings;
        this.getter = getter;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront || !this.visible)  {
            // only render on front
            return ;
        }

        const value = this.getter(context, this.size);
        if (value) {
            const render = <IMarkRender<number>>renderLocator.getMarkRender('number');
            const y = this.yaxis.toX(value);
            render.render(this.area.frontCanvas, value, { x: 0, y: y }, this.size, this.settings.precision());
        }
    }
}
