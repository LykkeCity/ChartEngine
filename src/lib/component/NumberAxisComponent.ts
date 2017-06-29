/**
 * NumberAxisComponent class.
 */
import { NumberAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { ChartArea, SizeChangedArgument, YArea } from '../layout/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';
import { NumberMarker } from './NumberMarker';

export class NumberAxisComponent extends VisualComponent {

    private readonly axis: NumberAxis;
    private readonly area: YArea;

    constructor(
        chartArea: ChartArea,
        numberAxis: NumberAxis,
        offset: Point, size: ISize,
        settings: IChartingSettings
        ) {
        super(offset, size);

        this.axis = numberAxis;
        this.area = chartArea.getYArea();
        this.area.sizeChanged.on(this.onresize);

        const priceMarker = new NumberMarker(this.area, {x: 0, y: 0}, size, numberAxis, settings, (ctx, s) => {
            const mouseY = ctx.mousePosition ? ctx.mousePosition.y : -1;
            return (mouseY > 0 && mouseY < this.size.height) ? numberAxis.toValue(mouseY) : undefined;
        });
        this.addChild(priceMarker);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        this._size = arg.size;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            //const canvas = context.getCanvas(this.target);
            const render = <IAxesRender<number>>renderLocator.getAxesRender('number');
            render.render(this.area.baseCanvas, this.axis, { x: this.offset.x, y: this.offset.y, w: this.size.width, h: this.size.height});
        }
        super.render(context, renderLocator);
    }
}
