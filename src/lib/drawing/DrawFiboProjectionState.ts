/**
 * Classes for drawing fibonacci projection.
 */
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, Constants, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class FiboProjectionFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new FiboProjectionSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private pc: PointFigureComponent;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;

    public get pointA(): IChartPoint {
        return this.pa.point;
    }

    public set pointA(value: IChartPoint) {
        this.pa.point = value;
    }

    public get pointB(): IChartPoint {
        return this.pb.point;
    }

    public set pointB(value: IChartPoint) {
        this.pb.point = value;
    }

    public get pointC(): IChartPoint {
        return this.pc.point;
    }

    public set pointC(value: IChartPoint) {
        this.pc.point = value;
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
        super('Fibo Projection', offset, size, container);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('a'));
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('b'));
        this.pc = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('c'));

        this.addChild(this.pa);
        this.addChild(this.pb);
        this.addChild(this.pc);
    }

    private getTimeRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.uid !== undefined && this.pb.point.uid !== undefined && this.pc.point.uid !== undefined) {
            return {
                start: Uid.min(this.pa.point.uid, this.pb.point.uid, this.pc.point.uid),
                end: Uid.max(this.pa.point.uid, this.pb.point.uid, this.pc.point.uid)
            };
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.v !== undefined && this.pb.point.v !== undefined && this.pc.point.v !== undefined) {
            return {
                start: Math.min(this.pa.point.v, this.pb.point.v, this.pc.point.v),
                end: Math.max(this.pa.point.v, this.pb.point.v, this.pc.point.v)
            };
        }
    }

    public isHit(p: IPoint): boolean {
        const a = this.pa.getXY();
        const b = this.pb.getXY();
        const c = this.pc.getXY();

        if (a && b && c) {
            return DrawUtils.IS_POINT_ON_LINE(p, a, b, 5)
                || DrawUtils.IS_POINT_ON_LINE(p, b, c, 5);
        }

        return false;
    }

    public setSelected(selected: boolean): void {
        super.setSelected(selected);
        this.valueRegion.visible = selected;
        this.timeRegion.visible = selected;
    }

    public shift(dx: number, dy: number): boolean {
        const a = this.pa.shift(dx, dy);
        const b = this.pb.shift(dx, dy);
        const c = this.pc.shift(dx, dy);
        return a || b || c;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }
        const frame = { x: this.offset.x, y: this.offset.y, w: this.size.width, h: this.size.height };

        const a = this.pa.getXY();
        const b = this.pb.getXY();
        const c = this.pc.getXY();

        const canvas = this.area.frontCanvas;

        canvas.setStrokeStyle(this.settings.color);
        canvas.lineWidth = this.settings.width;
        canvas.beginPath();

        if (a && b && !c) {
            canvas.moveTo(a.x, a.y);
            canvas.lineTo(b.x, b.y);
        } else if (a && b && c) {
            const length100 = b.y - a.y;

            const x = c.x;
            const maxx = frame.x + frame.w;
            const basey = c.y;

            const p1 = { x: x , y: basey + length100 * Constants.FIBO_PERCENTAGE[1] };
            const p2 = { x: x , y: basey + length100 * Constants.FIBO_PERCENTAGE[2] };
            const p3 = { x: x , y: basey + length100 * Constants.FIBO_PERCENTAGE[3] };

            const extP1 = { x: maxx, y: p1.y };
            const extP2 = { x: maxx, y: p2.y };
            const extP3 = { x: maxx, y: p3.y };

            if (this.isSelected) {
                canvas.moveTo(a.x, a.y);
                canvas.lineTo(b.x, b.y);
                canvas.lineTo(c.x, c.y);
            }

            canvas.moveTo(c.x, c.y); canvas.lineTo(maxx, c.y); // level 0
            canvas.moveTo(p1.x, p1.y); canvas.lineTo(extP1.x, extP1.y);
            canvas.moveTo(p2.x, p2.y); canvas.lineTo(extP2.x, extP2.y);
            canvas.moveTo(p3.x, p3.y); canvas.lineTo(extP3.x, extP3.y);
        }
        canvas.stroke();

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditPitchforkState.instance;
    }

    public getSettings(): SettingSet {
        return new SettingSet({
            name: 'line',
            group: true,
            settings: [
                {
                    name: 'color',
                    value: this.settings.color.toString(),
                    settingType: SettingType.color,
                    displayName: 'Color'
                }, {
                    name: 'width',
                    value: this.settings.width.toString(),
                    settingType: SettingType.numeric,
                    displayName: 'Width'
                }
            ]
        });
    }

    public setSettings(value: SettingSet): void {
        this.settings.color = value.getValueOrDefault<string>('line.color', this.settings.color);
        this.settings.width = value.getValueOrDefault<number>('line.width', this.settings.width);

        // rerender
        //this.context.render();
    }
}

export class FiboProjectionSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawFiboProjectionState extends FigureStateBase {
    private static inst?: DrawFiboProjectionState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawFiboProjectionState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: FiboProjectionFigureComponent;
    private count = 0;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
        this.count = 0;
        super.activate(board, mouse, stack, parameters);
    }

    protected addPoint(mouse: IMouse): void {
        if (!this.board || !this.stack) {
            return;
        }

        const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

        if (this.count === 0) {
            this.figure = <FiboProjectionFigureComponent>this.stack.addFigure(FigureType.fiboprojection);

            this.figure.pointA = { uid: coordX, v: coordY };
            this.figure.pointB = { uid: coordX, v: coordY };
        } else if (this.count === 2) {
            if (this.figure) {
                this.figure.pointC = { uid: coordX, v: coordY };
            }
        } else if (this.count > 2) {
            this.exit();
        }

        this.count += 1;
    }

    protected setLastPoint(mouse: IMouse): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

        if (coordX && coordY) {
            if (this.count === 2) {
                this.figure.pointB = { uid: coordX, v: coordY };
            } else if (this.count === 3) {
                this.figure.pointC = { uid: coordX, v: coordY };
            }
        }
    }

    private exit(): void {
        this.figure = undefined;
        this.stack = undefined;
        if (this.board) {
            this.board.changeState('hover');
        }
    }
}

class EditPitchforkState implements IStateController {
    private static inst?: EditPitchforkState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditPitchforkState();
        }
        return this.inst;
    }

    private last = new Point();
    private chartStack?: IChartStack;
    private line?: FiboProjectionFigureComponent;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.line && this.chartStack) {
            // Change mouse x/y only if line was shifted. Ignoring "empty" movement.
            const shifted = this.line.shift(mouse.pos.x - this.last.x, mouse.pos.y - this.last.y);
            if (shifted) {
                [this.last.x, this.last.y] = [mouse.pos.x, mouse.pos.y];
            }
        } else {
            [this.last.x, this.last.y] = [mouse.pos.x, mouse.pos.y];
            console.debug('Edit state: line or chartStack is not found.');
        }
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void { }

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        [this.last.x, this.last.y] = [mouse.pos.x, mouse.pos.y];

        this.chartStack = stack;

        if (activationParameters && activationParameters['component']) {
            this.line = <FiboProjectionFigureComponent>activationParameters['component'];
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
