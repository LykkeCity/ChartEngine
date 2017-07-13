/**
 * Classes for drawing horizontal lines.
 */

import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, ICoordsConverter, IMouse, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

class HorizontalLineFigureComponent extends FigureComponent implements IHoverable, IEditable {
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
        private yaxis: IValueCoordConverter<number>
        ) {
        super('Horizontal Line', offset, size);

        this.p = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);

        this.addChild(this.p);
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
                canvas.setStrokeStyle('#FF0000');
            } else {
                canvas.setStrokeStyle('#FF0000');
            }

            canvas.lineWidth = 2;
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
    private static inst?: DrawHorizontalLineState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawHorizontalLineState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private stack?: IChartStack;
    private figure?: HorizontalLineFigureComponent;
    private count = 0;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
        this.stack = stack;
        this.count = 0;
        super.activate(board, mouse, stack, parameters);
    }

    protected addPoint(mouse: IMouse): void {
        if (!this.board || !this.stack) {
            return;
        }

        if (this.count === 0) {
            this.figure = <HorizontalLineFigureComponent>this.stack.addFigure((area, offset, size, settings, coords, taxis) => {
                return new HorizontalLineFigureComponent(area, offset, size, settings, coords, taxis);
            });

            const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

            this.figure.point = { uid: coordX, v: coordY };

            this.exit();
        }

        this.count += 1;
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

class EditHorizontalLineState implements IStateController {
    private static inst?: EditHorizontalLineState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditHorizontalLineState();
        }
        return this.inst;
    }

    private chartStack?: IChartStack;
    private line?: HorizontalLineFigureComponent;

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.line && this.chartStack) {
            const coordY = this.chartStack.yToValue(mouse.pos.y - board.offset.y - this.chartStack.offset.y);
            this.line.point = { uid: this.line.point.uid, v: coordY };
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
            this.line = <HorizontalLineFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        this.line = undefined;
        this.chartStack = undefined;
        board.changeState('hover');
    }
}
