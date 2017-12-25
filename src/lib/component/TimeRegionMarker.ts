/**
 * TimeRegionMarker class.
 */
import { NumberAxis } from '../axes/index';
import { ITimeCoordConverter, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { Uid } from '../model/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class TimeRegionMarker extends VisualComponent {

    private readonly taxis: ITimeCoordConverter;
    private readonly settings: IChartingSettings;
    private readonly getter: (ctx: VisualContext, size: ISize) => IRange<Uid>|undefined;

    constructor(
        private readonly area: Area,
        offset: Point, size: ISize, taxis: ITimeCoordConverter, settings: IChartingSettings, getter: (ctx: VisualContext, size: ISize) => IRange<Uid>|undefined ) {
        super(offset, size);
        this.taxis = taxis;
        this.settings = settings;
        this.getter = getter;
        this.visible = false;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront || !this.visible)  {
            // only render on front
            return ;
        }

        const value = this.getter(context, this.size);
        if (value) {
            const x1 = this.taxis.toX(value.start);
            const x2 = this.taxis.toX(value.end);

            // Render
            if (x1 !== undefined && x2 !== undefined) {
                const canvas = this.area.frontCanvas;
                canvas.fillStyle = 'rgba(190, 230, 255, 0.3)';
                canvas.fillRect(Math.min(x1, x2), 0, Math.abs(x2 - x1), this.size.height);
            }
        }
    }
}
