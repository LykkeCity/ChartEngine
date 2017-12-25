/**
 * TimeAxisComponent class.
 */
import { IAxis, ITimeAxis, VisualComponent, VisualContext } from '../core/index';
import { BoardArea, SizeChangedArgument, XArea } from '../layout/index';
import { Uid } from '../model/index';
import { IAxesRender, IRenderLocator, ITimeAxisRender } from '../render/index';
import { ISize, Point } from '../shared/index';
import { TimeMarker } from './TimeMarker';

export class TimeAxisComponent extends VisualComponent {

    private readonly tAxis: ITimeAxis;
    private readonly area: XArea;
    private readonly marker: TimeMarker;
    private mouse?: Point;

    constructor(
        area: BoardArea,
        timeAxis: ITimeAxis
        ) {
        super();
        this.tAxis = timeAxis;

        this.area = area.getXArea();
        this.area.sizeChanged.on(this.onresize);

        this._size = this.area.size;

        this.marker = new TimeMarker(this.area, this.offset, this.size, timeAxis, this.getMarkPos);
        this.marker.visible = true;
        this.addChild(this.marker);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        this._size = arg.size;
        this.marker.resize(arg.size.width, arg.size.height);
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

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            //const canvas = context.getCanvas(this.target);
            const render = <ITimeAxisRender>renderLocator.getAxesRender('date');
            render.render(this.area.baseCanvas, this.tAxis, { x: 0, y: 0, w: this.size.width, h: this.size.height});
        }

        // const childContext = new VisualContext(context.renderBase, context.renderFront,
        //                                        context.getCanvas('base'), context.getCanvas('front'), context.mousePosition);
        super.render(context, renderLocator);
    }

    private getMarkPos = (ctx: VisualContext, size: ISize): Uid|undefined => {
        if (this.mouse) {
            return (this.mouse.x > 0 && this.mouse.x < size.width) ? this.tAxis.toValue(this.mouse.x) : undefined;
        }
    }
}
