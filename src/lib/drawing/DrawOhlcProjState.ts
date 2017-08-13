/**
 * Classes for drawing OHLC projection.
 */
import { CanvasWrapper } from '../canvas/index';
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ISource, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class OhlcProjFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new OhlcProjSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private pc: PointFigureComponent;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;
    private hhll: Candlestick|undefined;

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
        container: StoreContainer,
        private source?: ISource
        ) {
        super('OHLC Projection', offset, size, container);

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

        // update values after loading figures
        this.updateHHLL();

        this.subscribe();
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

        return (a && b && c)
            ? (DrawUtils.IS_POINT_ON_LINE(p, a, b, 5)
               || DrawUtils.IS_POINT_ON_LINE(p, b, c, 5)
               || DrawUtils.IS_POINT_ON_LINE(p, c, a, 5))
            : false;
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

        if (a && b) {
            const canvas = this.area.frontCanvas;

            canvas.setStrokeStyle(this.settings.color);
            canvas.lineWidth = this.settings.width;
            canvas.beginPath();

            canvas.moveTo(a.x, frame.y);
            canvas.lineTo(a.x, frame.y + frame.h);

            canvas.moveTo(b.x, frame.y);
            canvas.lineTo(b.x, frame.y + frame.h);

            if (c) {
                canvas.moveTo(c.x, frame.y);
                canvas.lineTo(c.x, frame.y + frame.h);
            }

            let minx = Math.min(a.x, b.x);
            let maxx = Math.max(a.x, b.x, c ? c.x : -Infinity);
            if (this.hhll) {
                if (this.hhll.o) { this.hline(canvas, minx, this.yaxis.toX(this.hhll.o), maxx - minx); }
                if (this.hhll.c) { this.hline(canvas, minx, this.yaxis.toX(this.hhll.c), maxx - minx); }
                if (this.hhll.h) { this.hline(canvas, minx, this.yaxis.toX(this.hhll.h), maxx - minx); }
                if (this.hhll.l) { this.hline(canvas, minx, this.yaxis.toX(this.hhll.l), maxx - minx); }
            }

            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    private hline(canvas: CanvasWrapper, x: number, y: number, l: number) {
        canvas.moveTo(x, y);
        canvas.lineTo(x + l, y);
    }

    public getEditState(): IStateController {
        return EditOhlcProjState.instance;
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

    private subscribe(sub: boolean = true) {
        if (sub) {
            this.pa.changed.on(this.onPointAChanged);
            this.pb.changed.on(this.onPointBChanged);
            this.pc.changed.on(this.onPointCChanged);
        } else {
            this.pa.changed.off(this.onPointAChanged);
            this.pb.changed.off(this.onPointBChanged);
            this.pc.changed.off(this.onPointCChanged);
        }
    }

    private onPointAChanged = () => {
        this.subscribe(false);
        this.constraintPointLast(this.pa);
        this.constraintPoint(this.pa, undefined, this.pb.point);
        this.updateHHLL();
        this.subscribe();
    }

    private onPointBChanged = () => {
        this.subscribe(false);
        this.constraintPointLast(this.pb);
        this.constraintPoint(this.pb, this.pa.point, this.pc.point);
        this.updateHHLL();
        this.subscribe();
    }

    private onPointCChanged = () => {
        this.subscribe(false);
        this.constraintPoint(this.pc, this.pb.point, undefined);
        this.subscribe();
    }

    private constraintPoint(p: PointFigureComponent, pfrom?: IChartPoint, pto?: IChartPoint) {
        if (pfrom && p.point.uid && pfrom.uid && p.point.uid.compare(pfrom.uid) < 0) {
            p.point = { uid: pfrom.uid, v: p.point.v };
        }
        if (pto && p.point.uid && pto.uid && p.point.uid.compare(pto.uid) > 0) {
            p.point = { uid: pto.uid, v: p.point.v };
        }
    }

    private constraintPointLast(p: PointFigureComponent) {
        if (this.source) {
            const last = this.source.getLastCandle();
            if (last && p.point.uid && p.point.uid.compare(last.uid) > 0) {
                p.point = { uid: last.uid, v: p.point.v };
            }
        }
    }

    private updateHHLL() {
        this.hhll = undefined;
        if (this.source && this.pa.point.uid && this.pb.point.uid) {
            this.hhll = this.source.getHHLL(this.pa.point.uid, this.pb.point.uid);
        }
    }
}

export class OhlcProjSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawOhlcProjState extends FigureStateBase {
    private static inst?: DrawOhlcProjState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawOhlcProjState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: OhlcProjFigureComponent;
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

        if (this.count > 2) {
            this.exit();
            return;
        }

        const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

        if (this.count === 0) {
            this.figure = <OhlcProjFigureComponent>this.stack.addFigure(FigureType.ohlcproj);

            this.figure.pointA = { uid: coordX, v: coordY };
            this.figure.pointB = { uid: coordX, v: coordY };
        } else if (this.count === 1 && this.figure) {
            this.figure.pointB = { uid: coordX, v: coordY };
        } else if (this.count === 2 && this.figure) {
            this.figure.pointC = { uid: coordX, v: coordY };
        }

        this.count += 1;
    }

    protected setLastPoint(point: IPoint): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

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

class EditOhlcProjState extends FigureEditStateBase {
    private static inst?: EditOhlcProjState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditOhlcProjState();
        }
        return this.inst;
    }

    private figure?: OhlcProjFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (activationParameters && activationParameters['component']) {
            this.figure = <OhlcProjFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    protected shift(dx: number, dy: number): boolean {
        return this.figure ? this.figure.shift(dx, dy) : false;
    }

    protected exit(board: IChartBoard): void {
        this.figure = undefined;
        super.exit(board);
    }
}
