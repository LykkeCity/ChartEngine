/**
 * NumberMarker class.
 */
import { NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IMarkRender, IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';

export class NumberMarker extends VisualComponent {

    private readonly axis: NumberAxis;
    private readonly settings: IChartingSettings;

    constructor(
        private readonly area: Area,
        offset: Point, size: ISize, axis: NumberAxis, settings: IChartingSettings) {
        super(offset, size);
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
