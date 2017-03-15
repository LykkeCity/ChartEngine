/**
 * TimeAxisComponent class.
 */
import { TimeAxis } from '../axes/index';
import { VisualComponent, VisualContext } from '../core/index';
import { BoardArea, SizeChangedArgument, XArea } from '../layout/index';
import { IAxesRender, IRenderLocator } from '../render/index';
import { TimeMarker } from './TimeMarker';

export class TimeAxisComponent extends VisualComponent {

    private tAxis: TimeAxis;
    private area: XArea;

    constructor(
        area: BoardArea,
        timeAxis: TimeAxis
        ) {
        super();
        this.tAxis = timeAxis;

        this.area = area.addXAxis();
        this.area.sizeChanged.on(this.onresize);

        this._size = this.area.size;

        const timeMarker = new TimeMarker(this.area, this.offset, this.size, timeAxis);
        this.addChild(timeMarker);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        this._size = arg.size;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        if (context.renderBase) {
            //const canvas = context.getCanvas(this.target);
            const render = <IAxesRender<Date>>renderLocator.getAxesRender('date');
            render.render(this.area.baseCanvas, this.tAxis, { x: 0, y: 0, w: this.size.width, h: this.size.height});
        }

        // const childContext = new VisualContext(context.renderBase, context.renderFront,
        //                                        context.getCanvas('base'), context.getCanvas('front'), context.mousePosition);
        super.render(context, renderLocator);
    }
}
