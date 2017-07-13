/**
 * NumberAxisComponent class.
 */
import { NumberAxis } from '../axes/index';
import { IVisualComponent, VisualComponent, VisualContext } from '../core/index';
import { ChartArea, SizeChangedArgument, YArea } from '../layout/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { IPoint, ISize, Point } from '../shared/index';
import { IChartingSettings } from './Interfaces';
import { NumberMarker } from './NumberMarker';

export class NumberAxisComponent extends VisualComponent {

    private readonly axis: NumberAxis;
    private readonly area: YArea;
    private mouse?: Point;

    constructor(
        chartArea: ChartArea,
        numberAxis: NumberAxis,
        offset: IPoint, size: ISize,
        settings: IChartingSettings
        ) {
        super(offset, size);

        this.axis = numberAxis;
        this.area = chartArea.getYArea();
        this.area.sizeChanged.on(this.onresize);

        const priceMarker = new NumberMarker(this.area, {x: 0, y: 0}, size, numberAxis, settings, this.getMarkPos);
        this.addChild(priceMarker);
    }

    public handeMouse(relX: number, relY: number) {
        if (this.mouse) {
            this.mouse.x = relX;
            this.mouse.y = relY;
        } else {
            this.mouse = new Point(relX, relY);
        }

        super.handeMouse(relX, relY);
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

    private getMarkPos(ctx: VisualContext, size: ISize): number|undefined {
        if (this.mouse) {
            return (this.mouse.y > 0 && this.mouse.y < this.size.height) ? this.axis.toValue(this.mouse.y) : undefined;
        }
    }
}
