/**
 * 
 */
import { FigureComponent, IChartBoard, IChartStack, IEditable, IHoverable, ISelectable, IStateController } from '../component/index';
import { ChartPoint, IAxis, ICoordsConverter, IMouse, IPoint, Mouse, VisualContext }
    from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';

export class PointFigureComponent extends FigureComponent implements IHoverable, IEditable, ISelectable {
    private p = new ChartPoint();
    private isHovered = false;
    private isSelected = false;

    public get point(): ChartPoint {
        return this.p;
    }

    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private coords: ICoordsConverter
        ) {
        super(offset, size);
    }

    public isHit(x: number, y: number): boolean {
        if (this.p.uid && this.p.v) {
            const px = this.coords.toX(this.p.uid);
            const py = this.coords.toY(this.p.v);

            if (px) {
                const diff = Math.sqrt((px - x) * (px - x) + (py - y) * (py - y));
                return diff < 5;
            }
        }
        return false;
    }

    public setHovered(visible: boolean): void {
        this.isHovered = visible;
    }

    public setSelected(selected: boolean): void {
        this.isSelected = selected;
    }

    public getXY(): IPoint|undefined {
        if (this.p.uid && this.p.v) {
            const x = this.coords.toX(this.p.uid);
            const y = this.coords.toY(this.p.v);
            if (x !== undefined) {
                return { x: x, y: y };
            }
        }
    }

    public shift(dx: number, dy: number): boolean {
        const origPoint = new ChartPoint(this.p.uid, this.p.v);
        if (this.p.uid && this.p.v) {
            const px = this.coords.toX(this.p.uid);
            const py = this.coords.toY(this.p.v);

            if (px) {
                this.p.uid = this.coords.xToValue(px + dx);
                this.p.v = this.coords.yToValue(py + dy);
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
