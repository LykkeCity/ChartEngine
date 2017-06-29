/**
 * 
 */
import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberMarker, TimeMarker } from '../component/index';
import { ChartPoint, IAxis, ICoordsConverter, IMouse, IPoint, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, VisualContext }
    from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';

export class PointFigureComponent extends FigureComponent implements IHoverable, IEditable, ISelectable {
    private p = new ChartPoint();
    private timeMarker: TimeMarker;
    private valueMarker: NumberMarker;

    public get point(): ChartPoint {
        return this.p;
    }

    constructor(
        private area: ChartArea,
        offset: Point,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>
        ) {
        super(offset, size);

        this.valueMarker = new NumberMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValue);
        this.addChild(this.valueMarker);

        this.timeMarker = new TimeMarker(this.area.getXArea(), this.offset, this.size, taxis, this.getUid);
        this.addChild(this.timeMarker);
    }

    private getUid = (ctx: VisualContext, size: ISize) => {
        return this.p.uid;
    }

    private getValue = (ctx: VisualContext, size: ISize) => {
        return this.p.v;
    }

    public isHit(x: number, y: number): boolean {
        if (this.p.uid && this.p.v) {
            const px = this.taxis.toX(this.p.uid);
            const py = this.yaxis.toX(this.p.v);

            if (px) {
                const diff = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
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
        if (this.p.uid && this.p.v) {
            const x = this.taxis.toX(this.p.uid);
            const y = this.yaxis.toX(this.p.v);
            if (x !== undefined) {
                return { x: x, y: y };
            }
        }
    }

    public shift(dx: number, dy: number): boolean {
        const origPoint = new ChartPoint(this.p.uid, this.p.v);
        if (this.p.uid && this.p.v) {
            const px = this.taxis.toX(this.p.uid);
            const py = this.yaxis.toX(this.p.v);

            if (px) {
                this.p.uid = this.taxis.toValue(px + dx);
                this.p.v = this.yaxis.toValue(py + dy);
            }
        }
        return !this.p.equals(origPoint);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.p.uid && this.p.v) {
            const coord = this.getXY();
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

    private mouse = new Mouse();
    private chartStack?: IChartStack;
    private point?: PointFigureComponent;
    private currentCoords?: ChartPoint;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.point && this.chartStack) {

            //this.point.shift(mouse.x - this.mouse.x, mouse.y - this.mouse.y);

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            this.point.point.uid = coordX;
            this.point.point.v = coordY;

        } else {
            console.debug('Edit state: line or chartStack is not found.');
        }

        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: IChartBoard, mouse: IMouse, activationParameters?: IHashTable<any>): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            // this.currentCoords = this.chartStack.mouseToCoords(
            //     mouse.x - board.offset.x - this.chartStack.offset.x,
            //     mouse.y - board.offset.y - this.chartStack.offset.y);



        } else {
            throw new Error('Can not find hit chart stack.');
        }

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
