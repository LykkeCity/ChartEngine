/**
 * PriceAxisComponent class.
 */
import { PriceAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { ChartArea, SizeChangedArgument, YArea } from '../layout/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { IPoint, ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';
import { PriceMarker } from './PriceMarker';

export class PriceAxisComponent extends VisualComponent {

    private readonly axis: PriceAxis;
    private readonly area: YArea;
    private mouse?: Point;

    constructor(
        chartArea: ChartArea,
        priceAxis: PriceAxis,
        offset: IPoint, size: ISize,
        settings: IChartingSettings
        ) {
        super(offset, size);

        this.axis = priceAxis;
        this.area = chartArea.getYArea();
        this.area.sizeChanged.on(this.onresize);

        const marker = new PriceMarker(this.area, {x: 0, y: 0}, size, priceAxis, settings, this.getMarkPos);
        marker.visible = true;
        this.addChild(marker);
    }

    public handleMouse(relX: number, relY: number) {
        if (this.mouse) {
            this.mouse.x = relX;
            this.mouse.y = relY;
        } else {
            this.mouse = new Point(relX, relY);
        }

        super.handleMouse(relX, relY);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        this._size = arg.size;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            const render = <IAxesRender<number>>renderLocator.getAxesRender('price');
            render.render(this.area.baseCanvas, this.axis, { x: this.offset.x, y: this.offset.y, w: this.size.width, h: this.size.height});
        }
        super.render(context, renderLocator);
    }

    private getMarkPos = (ctx: VisualContext, size: ISize): number|undefined => {
        if (this.mouse) {
            return (this.mouse.y > 0 && this.mouse.y < this.size.height) ? this.axis.toValue(this.mouse.y) : undefined;
        }
    }
}
