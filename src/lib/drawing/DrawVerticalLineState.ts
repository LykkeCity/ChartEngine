/**
 * Classes for drawing vertical lines.
 */
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController }
    from '../component/index';
import { ChartPoint, Command, Constants, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, StoreContainer, VisualContext }
    from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class VerticalLineFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private store: SettingStore;
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

        this.store = new SettingStore(container);

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
                    canvas.setStrokeStyle(this.store.color);
                } else {
                    canvas.setStrokeStyle(this.store.color);
                }

                canvas.lineWidth = this.store.width;
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
    public constructor() {
        super();
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
            const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

            const stack = this.stack;
            let state: string;
            let figure: VerticalLineFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <VerticalLineFigureComponent>stack.addFigure(FigureType.vline);
                    },
                    () => { // undo
                        if (state) {
                            stack.restore(state);
                        }
                    }
                )
                .execute());

            if (figure) {
                this.figure = figure;
                this.figure.point = { uid: coordX, v: coordY };
            }

            this.board.treeChangedEvt.trigger();

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
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <VerticalLineFigureComponent>activationParameters['component'];

            // save state
            const state = stack.getState();
            this.undo = () => { stack.restore(state); };
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    protected shift(dx: number, dy: number): boolean {
        if (dx || dy) {
            this.isChanged = true;
        }
        return this.figure ? this.figure.shift(dx, dy) : false;
    }

    protected exit(board: IChartBoard): void {
        // add command to history
        if (this.isChanged && this.undo) {
            board.push2history(
                new Command(
                    () => {
                        // empty execute
                    },
                    this.undo
                ));
        }

        this.figure = undefined;
        this.undo = undefined;
        this.isChanged = false;
        super.exit(board);
    }
}

class SettingStore {

    public get color(): string {
        return this.container.getProperty('color') || Constants.DEFAULT_FORECOLOR;
    }

    public set color(value: string) {
        this.container.setProperty('color', value);
    }

    public get width(): number {
        return this.container.getProperty('width') || 1;
    }

    public set width(value: number) {
        this.container.setProperty('width', value);
    }

    constructor(
        private container: StoreContainer
    ) {
        // write initial values
        this.width = this.width;
        this.color = this.color;
    }
}
