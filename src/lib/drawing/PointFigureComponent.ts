/**
 * 
 */
import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberMarker, TimeMarker }
    from '../component/index';
import { ChartPoint, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, VisualContext }
    from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { Event, IEvent, IHashTable, IPoint, ISize, Point } from '../shared/index';

export class PointChangedEvent extends Event<void> {
}

export class PointChangedArgument {
    private p: IPoint;

    constructor(p: IPoint) {
        this.p = p;
    }

    public get point() {
        return this.p;
    }
}

export class PointFigureComponent extends FigureComponent implements IHoverable, IEditable, ISelectable {
    private p = new ChartPoint();
    private px = new Point();
    private timeMarker: TimeMarker;
    private valueMarker: NumberMarker;
    private _pixelMode = false;

    public get point(): IChartPoint {
        return this.p;
    }

    public set point(value: IChartPoint) {
        this.p.uid = value.uid;
        this.p.v = value.v;
        this.changedEvent.trigger();
    }

    public get pixel(): IPoint {
        return this.px;
    }

    public set pixel(value: IPoint) {
        this.px.x = value.x;
        this.px.y = value.y;
        this.changedEvent.trigger();
    }

    public get pixelMode(): boolean {
        return this._pixelMode;
    }

    protected changedEvent = new PointChangedEvent();
    public get changed(): IEvent<void> {
        return this.changedEvent;
    }

    constructor(
        private area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>,
        pixelMode = false
        ) {
        super('Point', offset, size);

        this._pixelMode = pixelMode;

        this.valueMarker = new NumberMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValue);
        this.addChild(this.valueMarker);

        this.timeMarker = new TimeMarker(this.area.getXArea(), this.offset, this.size, taxis, this.getUid);
        this.addChild(this.timeMarker);
    }

    private getUid = (ctx: VisualContext, size: ISize) => {
        return this.pixelMode ? this.taxis.toValue(this.px.x) : this.p.uid;
    }

    private getValue = (ctx: VisualContext, size: ISize) => {
        return this.pixelMode ? this.yaxis.toValue(this.px.y) : this.p.v;
    }

    public isHit(p: IPoint): boolean {

        if (!this.visible) {
            return false;
        }

        if (this.pixelMode) {
            const diff = Math.sqrt((this.px.x - p.x) * (this.px.x - p.x) + (this.px.y - p.y) * (this.px.y - p.y));
            return diff < 5;
        } else if (this.p.uid && this.p.v) {
            const px = this.taxis.toX(this.p.uid);
            const py = this.yaxis.toX(this.p.v);

            if (px) {
                const diff = Math.sqrt((px - p.x) * (px - p.x) + (py - p.y) * (py - p.y));
                return diff < 5;
            }
        }
        return false;
    }

    public setSelected(selected: boolean): void {
        super.setSelected(selected);
        this.timeMarker.visible = selected;
        this.valueMarker.visible = selected;
    }

    public getXY(): IPoint|undefined {
        if (this.pixelMode) {
            return this.px;
        }
        if (this.p.uid && this.p.v) {
            const x = this.taxis.toX(this.p.uid);
            const y = this.yaxis.toX(this.p.v);
            if (x !== undefined) {
                return { x: x, y: y };
            }
        }
    }

    public shift(dx: number, dy: number): boolean {
        if (this.pixelMode) {
            this.px.x += dx;
            this.px.y += dy;
        } else if (this.p.uid && this.p.v) {
            const origPoint = new ChartPoint(this.p.uid, this.p.v);
            const px = this.taxis.toX(this.p.uid);
            const py = this.yaxis.toX(this.p.v);

            if (px) {
                this.p.uid = this.taxis.toValue(px + dx);
                this.p.v = this.yaxis.toValue(py + dy);
            }

            return !this.p.equals(origPoint);
        }
        return false;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        let coord: IPoint|undefined;
        if (this.pixelMode) {
            coord = this.px;
        } else if (this.p.uid && this.p.v) {
            coord = this.getXY();
        }

        if (coord) {
            const canvas = this.area.frontCanvas;

            canvas.lineWidth = 2;
            canvas.beginPath();

            if (this.isHovered || this.isSelected) {
                canvas.arc(coord.x, coord.y, 5, 0, 2 * Math.PI, false);

                canvas.setFillStyle('#FFFFFF');
                canvas.setStrokeStyle('#606060');
                canvas.fill();
            } else {
                canvas.setStrokeStyle('#C9001D');
            }

            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    public getCreateState(): IStateController {
        throw new Error('Operation is not supported');
    }
    public getEditState(): IStateController {
        return EditPointState.instance;
    }
}

class EditPointState implements IStateController {
    private static inst?: EditPointState;
    private constructor() {}

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditPointState();
        }
        return this.inst;
    }

    private chartStack?: IChartStack;
    private point?: PointFigureComponent;

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.point && this.chartStack) {
            const relX = mouse.pos.x - board.offset.x - this.chartStack.offset.x;
            const relY = mouse.pos.y - board.offset.y - this.chartStack.offset.y;
            if (this.point.pixelMode) {
                this.point.pixel = { x: relX, y: relY };
            } else {
                const coordX = this.chartStack.xToValue(relX);
                const coordY = this.chartStack.yToValue(relY);
                this.point.point = { uid: coordX, v: coordY };
            }
        } else {
            console.debug('Edit state: line or chartStack is not found.');
        }
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void { }
    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        // Determine which ChartStack was hit
        //this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        this.chartStack = stack;
        // if (stack) {
        //     // this.currentCoords = this.chartStack.mouseToCoords(
        //     //     mouse.x - board.offset.x - this.chartStack.offset.x,
        //     //     mouse.y - board.offset.y - this.chartStack.offset.y);
        // } else {
        //     throw new Error('Can not find hit chart stack.');
        // }

        if (activationParameters && activationParameters['component']) {
            this.point = <PointFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        this.point = undefined;
        this.chartStack = undefined;
        board.changeState('hover');
    }
}
