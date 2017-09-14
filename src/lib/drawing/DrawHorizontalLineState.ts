/**
 * Classes for drawing horizontal lines.
 */

import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, Command, Constants, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class HorizontalLineFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private p: PointFigureComponent;
    private store: SettingStore;

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
        super('Horizontal Line', offset, size, container);

        this.store = new SettingStore(container);

        this.p = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('p'));

        this.addChild(this.p);
    }

    public shift(dx: number, dy: number): boolean {
        return this.p.shift(dx, dy);
    }

    public isHit(p: IPoint): boolean {

        if (!this.p.point.uid || !this.p.point.v) {
            return false;
        }

        // // TODO: Can be stored when coords are changed
        // const ax = this.coords.toX(this.pa.point.t === undefined ? <string>this.pa.point.uid : this.pa.point.t);
        // const bx = this.coords.toX(this.pb.point.t === undefined ? <string>this.pb.point.uid : this.pb.point.t);

        const pointy = this.yaxis.toX(this.p.point.v);
        // const by = this.coords.toY(this.pb.point.v);

        return p.y >= pointy - 3 && p.y <= pointy + 3;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.p.point.uid && this.p.point.v) {

            const y = this.yaxis.toX(this.p.point.v);

            const canvas = this.area.frontCanvas;

            if (this.isHovered) {
                canvas.setStrokeStyle(this.store.color);
            } else {
                canvas.setStrokeStyle(this.store.color);
            }

            canvas.lineWidth = this.store.width;
            canvas.beginPath();

            canvas.moveTo(0, y);
            canvas.lineTo(this.size.width, y);

            canvas.stroke();
            canvas.closePath();
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditHorizontalLineState.instance;
    }
}

export class DrawHorizontalLineState extends FigureStateBase {
    public constructor() {
        super();
    }

    private board?: IChartBoard;
    private figure?: HorizontalLineFigureComponent;
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
            let figure: HorizontalLineFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <HorizontalLineFigureComponent>stack.addFigure(FigureType.hline);
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

class EditHorizontalLineState extends FigureEditStateBase {
    private static inst?: EditHorizontalLineState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditHorizontalLineState();
        }
        return this.inst;
    }

    private figure?: HorizontalLineFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <HorizontalLineFigureComponent>activationParameters['component'];

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
