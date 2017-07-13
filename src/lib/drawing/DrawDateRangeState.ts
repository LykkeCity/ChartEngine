/**
 * Classes for drawing date ranges.
 */
import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, SettingSet, SettingType, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

class DateRangeFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new DateRangeSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
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

    public set pointB(v: IChartPoint) {
        this.pb.point = v;
    }

    constructor(
        private area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>
        ) {
        super('Date Range', offset, size);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);

        this.addChild(this.pa);
        this.addChild(this.pb);
    }

    private getTimeRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.uid !== undefined && this.pb.point.uid !== undefined) {
            return { start: this.pa.point.uid, end: this.pb.point.uid };
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.v !== undefined && this.pb.point.v !== undefined) {
            return { start: this.pa.point.v, end: this.pb.point.v };
        }
    }

    public isHit(p: IPoint): boolean {
        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const c = new Point(a.x, b.y);
            const d = new Point(b.x, a.y);

            const arrow1 = DrawUtils.MID(a, c);
            const arrow2 = DrawUtils.MID(b, d);

            return DrawUtils.IS_POINT_ON_LINE(p, a, c, 5)
              || DrawUtils.IS_POINT_ON_LINE(p, c, b, 5)
              || DrawUtils.IS_POINT_ON_LINE(p, b, d, 5)
              || DrawUtils.IS_POINT_ON_LINE(p, a, d, 5)
              || DrawUtils.IS_POINT_ON_LINE(p, arrow1, arrow2, 5);
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
        return a || b;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {

            const c = new Point(a.x, b.y);
            const d = new Point(b.x, a.y);
            const arrow1 = DrawUtils.MID(a, c);
            const arrow2 = DrawUtils.MID(b, d);

            const canvas = this.area.frontCanvas;

            canvas.setStrokeStyle(this.settings.color);
            canvas.lineWidth = this.settings.width;
            canvas.beginPath();

            canvas.setFillStyle('rgba(190, 230, 255, 0.3)');
            canvas.fillRect(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.abs(b.x - a.x), Math.abs(b.y - a.y));

            canvas.moveTo(a.x, a.y);
            canvas.lineTo(c.x, c.y);

            canvas.moveTo(d.x, d.y);
            canvas.lineTo(b.x, b.y);

            canvas.moveTo(arrow1.x, arrow1.y);
            canvas.lineTo(arrow2.x, arrow2.y);

            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditDateRangeState.instance;
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

export class DateRangeSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawDateRangeState extends FigureStateBase {
    private static inst?: DrawDateRangeState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawDateRangeState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private stack?: IChartStack;
    private figure?: DateRangeFigureComponent;
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
            this.figure = <DateRangeFigureComponent>this.stack.addFigure((area, offset, size, settings, tcoord, vcoord) => {
                return new DateRangeFigureComponent(area, offset, size, settings, tcoord, vcoord);
            });

            const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

            this.figure.pointA = { uid: coordX, v: coordY };
            this.figure.pointB = { uid: coordX, v: coordY };
        } else if (this.count > 1) {
            this.exit();
        }

        this.count += 1;
    }

    protected setLastPoint(mouse: IMouse): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        if (this.count === 2) {
            const coordX = this.stack.xToValue(mouse.pos.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(mouse.pos.y - this.board.offset.y - this.stack.offset.y);

            if (coordX && coordY) {
                this.figure.pointB = { uid: coordX, v: coordY };
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

class EditDateRangeState implements IStateController {
    private static inst?: EditDateRangeState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditDateRangeState();
        }
        return this.inst;
    }

    private last = new Point();
    private chartStack?: IChartStack;
    private line?: DateRangeFigureComponent;

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
            this.line = <DateRangeFigureComponent>activationParameters['component'];
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
