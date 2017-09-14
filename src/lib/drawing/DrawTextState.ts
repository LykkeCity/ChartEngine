/**
 * Classes for drawing text.
 */
import { CanvasTextAlign } from '../canvas/index';
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, Command, Constants, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, IRect, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class TextFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private store: SettingStore;
    private p: PointFigureComponent;
    private rect: IRect|undefined;

    public get point(): IChartPoint {
        return this.p.point;
    }

    public set point(v: IChartPoint) {
        this.p.point = v;
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
        super('Text', offset, size, container);

        this.store = new SettingStore(container);

        this.p = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);
        this.p.visible = false;
        this.addChild(this.p);
    }

    public isHit(p: IPoint): boolean {

        if (!this.p.point.uid || !this.p.point.v) {
            return false;
        }

        const x = this.taxis.toX(this.p.point.uid);
        const y = this.yaxis.toX(this.p.point.v);

        if (x !== undefined && this.rect) {
            return DrawUtils.IS_POINT_OVER_RECT(p, this.rect, 5);
        }
        return false;
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
            const y = this.yaxis.toX(this.p.point.v);

            if (x !== undefined) {
                const canvas = this.area.frontCanvas;
                canvas.setStrokeStyle('#FF0000');
                canvas.font = '15pt Arial';
                canvas.setTextAlign(CanvasTextAlign.Center);
                canvas.setFillStyle('#FF0000');
                const metrics = canvas.measureText(this.store.text);
                canvas.fillText(this.store.text, x, y);

                this.rect = { x: x, y: y, w: metrics.width, h: 15 }; // Height in px is equal to font size in pts
            }
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditTextState.instance;
    }
}

export class DrawTextState extends FigureStateBase {
    public constructor() {
        super();
    }

    private board?: IChartBoard;
    private figure?: TextFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
        this.stack = stack;
        super.activate(board, mouse, stack, parameters);
    }

    protected addPoint(point: IPoint): void {
        if (!this.board || !this.stack) {
            return;
        }

        const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

        const stack = this.stack;
        let state: string;
        let figure: TextFigureComponent|undefined;
        this.board.push2history(
            new Command(
                () => { // do
                    state = stack.getState();
                    figure = <TextFigureComponent>stack.addFigure(FigureType.text);
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

    protected setLastPoint(point: IPoint): void { }

    private exit(): void {
        this.figure = undefined;
        this.stack = undefined;
        if (this.board) {
            this.board.changeState('hover');
        }
    }
}

class EditTextState extends FigureEditStateBase {
    private static inst?: EditTextState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditTextState();
        }
        return this.inst;
    }

    private figure?: TextFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <TextFigureComponent>activationParameters['component'];

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

    public get text(): string {
        return this.container.getProperty('text') || '';
    }

    public set text(value: string) {
        this.container.setProperty('text', value);
    }

    constructor(
        private container: StoreContainer
    ) {
        // write initial values
        this.text = this.text;
        this.color = this.color;
    }
}
