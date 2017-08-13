/**
 * PointFigureComponent class
 */
import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberMarker, TimeMarker }
    from '../component/index';
import { ChartPoint, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, StoreContainer, VisualContext }
    from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { Event, IEvent, IHashTable, IPoint, ISize, Point } from '../shared/index';
import { FigureEditStateBase } from './FigureEditStateBase';

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
    private timeMarker: TimeMarker;
    private valueMarker: NumberMarker;
    private store: PointStore;

    public get point(): IChartPoint {
        return this.store.point;
    }

    public set point(value: IChartPoint) {
        this.store.point.uid = value.uid;
        this.store.point.v = value.v;
        this.store.setChanged();
        this.changedEvent.trigger();
    }

    public get pixel(): IPoint {
        return this.store.pixel;
    }

    public set pixel(value: IPoint) {
        this.store.pixel.x = value.x;
        this.store.pixel.y = value.y;
        this.changedEvent.trigger();
    }

    public get pixelMode(): boolean {
        return this.store.pixelMode;
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
        private container?: StoreContainer,
        pixelMode = false
        ) {
        super('Point', offset, size, container || new StoreContainer());

        this.store = new PointStore(container || new StoreContainer());

        this.store.pixelMode = pixelMode;

        this.valueMarker = new NumberMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValue);
        this.addChild(this.valueMarker);

        this.timeMarker = new TimeMarker(this.area.getXArea(), this.offset, this.size, taxis, this.getUid);
        this.addChild(this.timeMarker);
    }

    private getUid = (ctx: VisualContext, size: ISize) => {
        return this.pixelMode ? this.taxis.toValue(this.pixel.x) : this.point.uid;
    }

    private getValue = (ctx: VisualContext, size: ISize) => {
        return this.pixelMode ? this.yaxis.toValue(this.pixel.y) : this.point.v;
    }

    public isHit(p: IPoint): boolean {

        if (!this.visible) {
            return false;
        }

        if (this.pixelMode) {
            const diff = Math.sqrt((this.pixel.x - p.x) * (this.pixel.x - p.x) + (this.pixel.y - p.y) * (this.pixel.y - p.y));
            return diff < 5;
        } else if (this.point.uid && this.point.v) {
            const px = this.taxis.toX(this.point.uid);
            const py = this.yaxis.toX(this.point.v);

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
            return this.pixel;
        }
        if (this.point.uid && this.point.v) {
            const x = this.taxis.toX(this.point.uid);
            const y = this.yaxis.toX(this.point.v);
            if (x !== undefined) {
                return { x: x, y: y };
            }
        }
    }

    public shift(dx: number, dy: number): boolean {
        if (this.pixelMode) {
            this.pixel = { x: this.pixel.x + dx, y: this.pixel.y + dy };
        } else if (this.point.uid && this.point.v) {
            const origPoint = new ChartPoint(this.point.uid, this.point.v);
            const px = this.taxis.toX(this.point.uid);
            const py = this.yaxis.toX(this.point.v);

            if (px) {
                this.point = { uid: this.taxis.toValue(px + dx), v: this.yaxis.toValue(py + dy) };
            }

            return !this.store.point.equals(origPoint);
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
            coord = this.pixel;
        } else if (this.point.uid && this.point.v) {
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

class EditPointState extends FigureEditStateBase {
    private static inst?: EditPointState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditPointState();
        }
        return this.inst;
    }

    private figure?: PointFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (activationParameters && activationParameters['component']) {
            this.figure = <PointFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    protected shift(dx: number, dy: number): boolean {
        return this.figure ? this.figure.shift(dx, dy) : false;
    }

    protected exit(board: IChartBoard): void {
        this.figure = undefined;
        super.exit(board);
    }
}

class PointStore {

    public get point(): ChartPoint {
        return this.container.getProperty('point');
    }

    public set point(value: ChartPoint) {
        this.container.setProperty('point', value);
    }

    public get pixel(): Point {
        return this.container.getProperty('pixel');
    }

    public set pixel(value: Point) {
        this.container.setProperty('pixel', value);
    }

    public get pixelMode(): boolean {
        return this.container.getProperty('pixelmode');
    }

    public set pixelMode(value: boolean) {
        this.container.setProperty('pixelmode', value);
    }

    constructor(
        private container: StoreContainer
    ) {
        // ensure values are initialized
        const dto = container.getObjectProperty('point');
        const uid = dto.getObjectProperty('uid');
        const modelUid = new Uid(uid.getProperty('t'), uid.getProperty('n'));
        const model = dto ? new ChartPoint(modelUid, dto.getProperty('v')) : new ChartPoint();
        container.setProperty('point', model);

        container.setProperty('pixel', new Point());
    }

    public setChanged() {
        this.container.setChanged();
    }
}
