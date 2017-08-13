/**
 * Classes for drawing vertical lines.
 */
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController }
    from '../component/index';
import { ChartPoint, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, StoreContainer, VisualContext }
    from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class VerticalLineFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private p: PointFigureComponent;

    public get point(): IChartPoint {
        return this.p.point;
    }

    public set point(value: IChartPoint) {
        this.p.point = value;
    }

    constructor(
        private area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>,
        container: StoreContainer
        ) {
        super('Vertical Line', offset, size, container);

        this.p = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('p'));

        this.addChild(this.p);
    }

    public isHit(p: IPoint): boolean {

        if (!this.p.point.uid || !this.p.point.v) {
            return false;
        }

        const pointx = this.taxis.toX(this.p.point.uid);

        return pointx ? (p.x >= pointx - 3 && p.x <= pointx + 3) : false;
    }

    public shift(dx: number, dy: number): boolean {
        return this.p.shift(dx, dy);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.p.point.uid && this.p.point.v) {

            const x = this.taxis.toX(this.p.point.uid);

            if (x !== undefined) {
                const canvas = this.area.frontCanvas;

                if (this.isHovered) {
                    canvas.setStrokeStyle('#FF0000');
                } else {
                    canvas.setStrokeStyle('#FF0000');
                }

                canvas.lineWidth = 2;
                canvas.beginPath();

                canvas.moveTo(x, 0);
                canvas.lineTo(x, this.size.height);

                canvas.stroke();
                canvas.closePath();
            }
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditVerticalLineState.instance;
    }
}

export class DrawVerticalLineState extends FigureStateBase {
    private static inst?: DrawVerticalLineState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawVerticalLineState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: VerticalLineFigureComponent;
    private count = 0;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
        this.stack = stack;
        this.count = 0;
        super.activate(board, mouse, stack, parameters);
    }

    protected addPoint(point: IPoint): void {
        if (!this.board || !this.stack) {
            return;
        }

        if (this.count === 0) {
            this.figure = <VerticalLineFigureComponent>this.stack.addFigure(FigureType.vline);

            const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

            this.figure.point = { uid: coordX, v: coordY };

            this.exit();
        }

        this.count += 1;
    }

    protected setLastPoint(point: IPoint): void { }

    private exit(): void {
        this.figure = undefined;
        this.stack = undefined;
        if (this.board) {
            this.board.changeState('hover');
        }
    }
}

class EditVerticalLineState extends FigureEditStateBase {
    private static inst?: EditVerticalLineState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditVerticalLineState();
        }
        return this.inst;
    }

    private figure?: VerticalLineFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (activationParameters && activationParameters['component']) {
            this.figure = <VerticalLineFigureComponent>activationParameters['component'];
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
