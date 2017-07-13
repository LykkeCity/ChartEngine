/**
 * TimeMarker class.
 */
import { IAxis, ITimeAxis, ITimeCoordConverter, IVisualComponent, VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';

export class TimeMarker extends VisualComponent {

    private readonly area: Area;
    private readonly taxis: ITimeCoordConverter;
    private readonly getter: (ctx: VisualContext, size: ISize) => Uid|undefined;

    constructor(area: Area, offset: Point, size: ISize, taxis: ITimeCoordConverter, getter: (ctx: VisualContext, size: ISize) => Uid|undefined) {
        super(offset, size);
        this.area = area;
        this.taxis = taxis;
        this.getter = getter;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront || !this.visible)  {
            // only render on front
            return ;
        }

        const uid = this.getter(context, this.size);
        if (uid) {
            const x = this.taxis.toX(uid);
            const render = renderLocator.getMarkRender('date');
            render.render(this.area.frontCanvas, uid.t, { x: x, y: 0 }, this.size);
        }
    }
}
