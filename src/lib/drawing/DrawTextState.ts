/**
 * Classes for drawing text.
 */
import { CanvasTextAlign } from '../canvas/index';
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, IRect, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class TextFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private settings = new TextSettings();
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
                const metrics = canvas.measureText(this.settings.text);
                canvas.fillText(this.settings.text, x, y);

                this.rect = { x: x, y: y, w: metrics.width, h: 15 }; // Height in px is equal to font size in pts
            }
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditTextState.instance;
    }
}

export class TextSettings {
    public color = '#FF0000';
    public text = 'Text';
}

export class DrawTextState extends FigureStateBase {
    private static inst?: DrawTextState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawTextState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: TextFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
        this.stack = stack;
        super.activate(board, mouse, stack, parameters);
    }

    protected addPoint(mouse: IMouse): void {
        if (!this.board || !this.stack) {
            return;
        }

        this.figure = <TextFigureComponent>this.stack.addFigure(FigureType.text);

        const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

        this.figure.point = { uid: coordX, v: coordY };

        this.exit();
    }

    protected setLastPoint(mouse: IMouse): void { }

    private exit(): void {
        this.figure = undefined;
        this.stack = undefined;
        if (this.board) {
            this.board.changeState('hover');
        }
    }
}

class EditTextState implements IStateController {
    private static inst?: EditTextState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditTextState();
        }
        return this.inst;
    }

    private chartStack?: IChartStack;
    private figure?: TextFigureComponent;

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.figure && this.chartStack) {
            const coordX = this.chartStack.xToValue(mouse.pos.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.pos.y - board.offset.y - this.chartStack.offset.y);

            this.figure.point = { uid: coordX, v: coordY };
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
        this.chartStack = stack;

        if (activationParameters && activationParameters['component']) {
            this.figure = <TextFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        this.figure = undefined;
        this.chartStack = undefined;
        board.changeState('hover');
    }
}
