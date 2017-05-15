/**
 * Classes for drawing lines.
 */

import { FigureComponent, IChartBoard, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, IAxis, ICoordsConverter, IMouse, Mouse, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { PointFigureComponent } from './PointFigureComponent';

class LineFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private isHovered = false;

    public get pointA(): ChartPoint {
        return this.pa.point;
    }

    public get pointB(): ChartPoint {
        return this.pb.point;
    }

    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private coords: ICoordsConverter
        // private timeAxis: IAxis<Date>,
        // private yAxis: IAxis<number>
        ) {
        super(offset, size);

        this.pa = new PointFigureComponent(area, offset, size, coords);
        this.pb = new PointFigureComponent(area, offset, size, coords);

        this.addChild(this.pa);
        this.addChild(this.pb);
    }

    public isHit(x: number, y: number): boolean {

        // if ((!this.pa.point.t && !this.pa.point.uid) || !this.pa.point.v
        //   || (!this.pb.point.t && !this.pb.point.uid) || !this.pb.point.v) {
        //     return false;
        // }

        if (!this.pa.point.uid || !this.pa.point.v
          || !this.pb.point.uid || !this.pb.point.v) {
            return false;
        }

        return false;

        // // TODO: Can be stored when coords are changed
        // const ax = this.coords.toX(this.pa.point.t === undefined ? <string>this.pa.point.uid : this.pa.point.t);
        // const bx = this.coords.toX(this.pb.point.t === undefined ? <string>this.pb.point.uid : this.pb.point.t);

        // const ay = this.coords.toY(this.pa.point.v);
        // const by = this.coords.toY(this.pb.point.v);

        // if (ax && bx) {
        //     return DrawUtils.isPointInLine({ x: x, y: y }, { x: ax, y: ay }, { x: bx, y: by }, 0.05);
        // }
        // return false;
    }

    public setPopupVisibility(visible: boolean): void {
        this.isHovered = visible;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.pa.point.uid && this.pa.point.v && this.pb.point.uid && this.pb.point.v) {

            //const ax = this.coords.toX(this.pa.point.t === undefined ? <string>this.pa.point.uid : this.pa.point.t);
            const ax = this.coords.toX(this.pa.point.uid);
            const ay = this.coords.toY(this.pa.point.v);

            //const bx = this.coords.toX(this.pb.point.t === undefined ? <string>this.pb.point.uid : this.pb.point.t);
            const bx = this.coords.toX(this.pb.point.uid);
            const by = this.coords.toY(this.pb.point.v);

            if (ax && bx) {
                const canvas = this.area.frontCanvas;

                if (this.isHovered) {
                    canvas.setStrokeStyle('#000BEF');
                } else {
                    canvas.setStrokeStyle('#C9001D');
                }

                canvas.lineWidth = 2;
                canvas.beginPath();

                canvas.moveTo(ax, ay);
                canvas.lineTo(bx, by);

                canvas.stroke();
                canvas.closePath();
            }
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditLineState.instance;
    }
}


export class DrawLineState implements IStateController {
    private static inst?: DrawLineState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawLineState();
        }
        return this.inst;
    }

    private mouse = new Mouse();
    private chartStack?: IChartStack;
    private line?: LineFigureComponent;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];

        if (this.line && this.chartStack) {
            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            if (coordX && coordY) {
                // this.line.pointB.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
                // this.line.pointB.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
                this.line.pointB.uid = coordX;
                this.line.pointB.v = coordY;
            }
        }
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
        this.line = undefined;
        this.chartStack = undefined;
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;

        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            this.line = <LineFigureComponent>this.chartStack.addFigure((area, offset, size, coords) => {
                //throw new Error('Not implemented');
                return new LineFigureComponent(area, offset, size, coords);
            });

            // const timeNumberCoords = this.chartStack.mouseToCoords(
            //     mouse.x - board.offset.x - this.chartStack.offset.x,
            //     mouse.y - board.offset.y - this.chartStack.offset.y
            // );

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            // this.line.pointA.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
            // this.line.pointA.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
            this.line.pointA.uid = coordX;
            this.line.pointA.v = coordY;

            // this.line.pointB.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
            // this.line.pointB.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
            this.line.pointB.uid = coordX;
            this.line.pointB.v = coordY;
        }
    }

    public activate(board: IChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        board.changeState('hover');
    }
}

class EditLineState implements IStateController {
    private static inst?: EditLineState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditLineState();
        }
        return this.inst;
    }

    private mouse = new Mouse();
    private chartStack?: IChartStack;
    private line?: LineFigureComponent;
    private currentCoords?: ChartPoint;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.line && this.chartStack) {
        //     const timeNumberCoords = this.chartStack.mouseToCoords(
        //         mouse.x - board.offset.x - this.chartStack.offset.x,
        //         mouse.y - board.offset.y - this.chartStack.offset.y);

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

        //     // Calculate difference
        //     // TODO: Get rid of excessive check for undefined values
        //     if (timeNumberCoords.t && timeNumberCoords.v
        //         && this.currentCoords && this.currentCoords.t && this.currentCoords.v
        //         && this.line.pointA.t && this.line.pointA.v && this.line.pointB.t && this.line.pointB.v) {

        //         const tdiff = timeNumberCoords.t.getTime() - this.currentCoords.t.getTime();
        //         const vdiff = timeNumberCoords.v - this.currentCoords.v;

        //         this.line.pointA.t = new Date(this.line.pointA.t.getTime() + tdiff);
        //         this.line.pointA.v = this.line.pointA.v + vdiff;

        //         this.line.pointB.t = new Date(this.line.pointB.t.getTime() + tdiff);
        //         this.line.pointB.v = this.line.pointB.v + vdiff;

        //         this.currentCoords = timeNumberCoords;
        //     }
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
            this.line = <LineFigureComponent>activationParameters['component'];
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
