/**
 * PriceMarker class.
 */
import { PriceAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class PriceMarker extends VisualComponent {

    private readonly area: Area;
    private readonly axis: PriceAxis;
    private readonly settings: IChartingSettings;

    constructor(area: Area, offset: Point, size: ISize, axis: PriceAxis, settings: IChartingSettings) {
        super(offset, size);
        this.area = area;
        this.axis = axis;
        this.settings = settings;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (!context.renderFront)  {
            // only render on front
            return ;
        }

        if (context.mousePosition) {
            const mouseY = context.mousePosition.y;

            if (mouseY > 0 && mouseY < this.size.height) {
                const render = <IMarkRender<number>>renderLocator.getMarkRender('number');
                const num = this.axis.toValue(mouseY);
                render.render(this.area.frontCanvas, num, { x: 0, y: mouseY }, this.size, this.settings.precision());
            }
        }
    }
}
