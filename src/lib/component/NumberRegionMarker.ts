/**
 * RegionMarker class.
 */
import { NumberAxis } from '../axes/index';
import { IValueCoordConverter, IVisualComponent, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class NumberRegionMarker extends VisualComponent {

    private readonly yaxis: IValueCoordConverter<number>;
    private readonly settings: IChartingSettings;
    private readonly getter: (ctx: VisualContext, size: ISize) => IRange<number>|undefined;

    constructor(
        private readonly area: Area,
        offset: Point, size: ISize, yaxis: IValueCoordConverter<number>, settings: IChartingSettings, getter: (ctx: VisualContext, size: ISize) => IRange<number>|undefined ) {
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
            //const render = <IMarkRender<number>>renderLocator.getMarkRender('number');
            const y1 = this.yaxis.toX(value.start);
            const y2 = this.yaxis.toX(value.end);
            //render.render(this.area.frontCanvas, value, { x: 0, y: y }, this.size, this.settings.precision());

            const canvas = this.area.frontCanvas;
            canvas.fillStyle = 'rgba(190, 230, 255, 0.3)';
            canvas.fillRect(0, Math.min(y1, y2), this.size.width, Math.abs(y2 - y1));
        }
    }
}
