/**
 * PriceAxisComponent class.
 */
import { PriceAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { ChartArea, SizeChangedArgument, YArea } from '../layout/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';
import { PriceMarker } from './PriceMarker';

export class PriceAxisComponent extends VisualComponent {

    private readonly axis: PriceAxis;
    private readonly area: YArea;

    constructor(
        chartArea: ChartArea,
        priceAxis: PriceAxis,
        offset: Point, size: ISize,
        settings: IChartingSettings
        ) {
        super(offset, size);

        this.axis = priceAxis;
        this.area = chartArea.addYAxis();
        this.area.sizeChanged.on(this.onresize);

        const priceMarker = new PriceMarker(this.area, {x: 0, y: 0}, size, priceAxis, settings);
        this.addChild(priceMarker);
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
}
