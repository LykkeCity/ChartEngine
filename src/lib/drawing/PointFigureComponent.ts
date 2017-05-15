/**
 * 
 */
import { FigureComponent, IChartBoard, IChartStack, IEditable, IHoverable, IStateController } from '../component/index';
import { ChartPoint, IAxis, ICoordsConverter, IMouse, Mouse, VisualContext }
    from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';

export class PointFigureComponent extends FigureComponent implements IHoverable, IEditable {
    private p = new ChartPoint();
    private isHovered = false;

    public get point(): ChartPoint {
        return this.p;
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
    }

    public isHit(x: number, y: number): boolean {

        if (this.p.uid && this.p.v) {
            //const px = this.coords.toX(this.p.t === undefined ? <string>this.p.uid : this.p.t);
            const px = this.coords.toX(this.p.uid);
            const py = this.coords.toY(this.p.v);

            if (px) {
                const diff = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
                return diff < 5;
            }
        }
        return false;
    }

    public setPopupVisibility(visible: boolean): void {
        this.isHovered = visible;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        if (this.p.uid && this.p.v) {
            // const x = this.timeAxis.toX(this.p.t);
            // const y = this.yAxis.toX(this.p.v);

            //const x = this.coords.toX(this.p.t === undefined ? <string>this.p.uid : this.p.t);
            const x = this.coords.toX(this.p.uid);
            const y = this.coords.toY(this.p.v);

            if (x) {
                const canvas = this.area.frontCanvas;

                canvas.lineWidth = 2;
                canvas.beginPath();


                if (this.isHovered) {
                    canvas.arc(x, y, 5, 0, 2 * Math.PI, false);

                    canvas.setFillStyle('#FFFFFF');
                    canvas.setStrokeStyle('#606060');
                    canvas.fill();
                } else {
                    canvas.setStrokeStyle('#C9001D');
                }

                canvas.stroke();
                canvas.closePath();
            }
        }
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

            // const timeNumberCoords = this.chartStack.mouseToCoords(
            //     mouse.x - board.offset.x - this.chartStack.offset.x,
            //     mouse.y - board.offset.y - this.chartStack.offset.y);

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            //this.point.point.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
            //this.point.point.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
            this.point.point.uid = coordX;
            this.point.point.v = coordY;

            // // Calculate difference
            // // TODO: Get rid of excessive check for undefined values
            // if (timeNumberCoords.t && timeNumberCoords.v
            //     && this.currentCoords && this.currentCoords.t && this.currentCoords.v
            //     && this.point.point.t && this.point.point.v) {

            //     const tdiff = timeNumberCoords.t.getTime() - this.currentCoords.t.getTime();
            //     const vdiff = timeNumberCoords.v - this.currentCoords.v;

            //     this.point.point.t = new Date(this.point.point.t.getTime() + tdiff);
            //     this.point.point.uid = ;
            //     this.point.point.v = this.point.point.v + vdiff;

            //     this.currentCoords = timeNumberCoords;
            // }
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
