/**
 * Classes for drawing trend channels.
 */

import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class TrendChannelFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new TrendChannelSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private pc: PointFigureComponent;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;
    private store: ChannelStore;

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

    public get spread(): number {
        return this.store.spread;
    }

    public set spread(value: number) {
        this.store.spread = value;
        this.updatePoints();
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
        super('Trend channel', offset, size, container);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('a'));
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('b'));
        this.pc = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, undefined, true);
        this.addChild(this.pa);
        this.addChild(this.pb);
        this.addChild(this.pc);

        this.store = new ChannelStore(container);
        // recompute point after loading figure
        this.updatePoints();

        this.subscribe();
    }

    public isHit(p: IPoint): boolean {
        const a = this.pa.getXY();
        const b = this.pb.getXY();

        let hit = false;
        if (a && b) {
            const spread = this.store.spread;
            hit = DrawUtils.IS_POINT_ON_LINE(p, a, b, 5)
                  || DrawUtils.IS_POINT_ON_LINE(p, { x: a.x , y: a.y + spread }, { x: b.x , y: b.y + spread }, 5);
        }
        return hit;
    }

    public setSelected(selected: boolean): void {
        super.setSelected(selected);
        this.valueRegion.visible = selected;
        this.timeRegion.visible = selected;
    }

    public shift(dx: number, dy: number): boolean {
        const a = this.pa.shift(dx, dy);
        const b = this.pb.shift(dx, dy);

        this.updatePoints();
        return a || b;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        // only render on front
        if (!context.renderFront) {
            return;
        }

        const a = this.pa.getXY();
        const b = this.pb.getXY();

        const canvas = this.area.frontCanvas;
        canvas.setStrokeStyle(this.settings.color);
        canvas.lineWidth = this.settings.width;

        if (a && b) {
            // update computed points' coordinates
            this.updatePoints();

            canvas.beginPath();
            canvas.moveTo(a.x, a.y);
            canvas.lineTo(b.x, b.y);
            canvas.stroke();

            const spread = this.store.spread;
            if (spread) { // if not 0 or undefined
                canvas.beginPath();
                canvas.moveTo(a.x, a.y + spread);
                canvas.lineTo(b.x, b.y + spread);
                canvas.stroke();
            }
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditTrendChannelState.instance;
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

    private computeSpread(p: IPoint): number|undefined {
        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const y = DrawUtils.LINEAR(a, b, p.x);
            return y !== undefined ? p.y - y : 0;
        }
    }

    private getTimeRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.uid !== undefined && this.pb.point.uid) {
            return {
                start: Uid.min(this.pa.point.uid, this.pb.point.uid),
                end: Uid.max(this.pa.point.uid, this.pb.point.uid)
            };
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.v !== undefined && this.pb.point.v !== undefined) {
            return {
                start: Math.min(this.pa.point.v, this.pb.point.v),
                end: Math.max(this.pa.point.v, this.pb.point.v)
            };
        }
    }

    private subscribe(sub: boolean = true) {
        if (sub) {
            this.pa.changed.on(this.onPointChanged);
            this.pb.changed.on(this.onPointChanged);
            this.pc.changed.on(this.onP3changed);
        } else {
            this.pa.changed.off(this.onPointChanged);
            this.pb.changed.off(this.onPointChanged);
            this.pc.changed.off(this.onP3changed);
        }
    }

    private onPointChanged = () => {
        this.updatePoints();
    }

    private onP3changed = () => {
        const updSpread = this.computeSpread(this.pc.pixel);
        this.store.spread = updSpread || this.store.spread;
    }

    private updatePoints() {
        this.subscribe(false); // prevent change events while recomputing

        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const mid = DrawUtils.MID(a, b);
            this.pc.pixel = { x: mid.x, y: mid.y + this.store.spread };
        }
        this.subscribe();
    }
}

export class TrendChannelSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawTrendChannelState extends FigureStateBase {
    private static inst?: DrawTrendChannelState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawTrendChannelState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: TrendChannelFigureComponent;
    private pa?: IPoint;
    private pb?: IPoint;
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

        const relX = mouse.pos.x - this.board.offset.x - this.stack.offset.x;
        const relY = mouse.pos.y - this.board.offset.y - this.stack.offset.y;
        const coordX = this.stack.xToValue(relX);
        const coordY = this.stack.yToValue(relY);

        if (this.count === 0) {
            this.figure = <TrendChannelFigureComponent>this.stack.addFigure(FigureType.trendchannel);

            this.figure.pointA = { uid: coordX, v: coordY };
            this.pa = { x: relX, y: relY };
        } else if (this.count === 1) {
            if (this.figure) {
                this.figure.pointB = { uid: coordX, v: coordY };
            }
            this.pb = { x: relX, y: relY };
        } else if (this.count === 3) {
            this.exit();
        }

        this.count += 1;
    }

    protected setLastPoint(mouse: IMouse): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        const relX = mouse.pos.x - this.board.offset.x - this.stack.offset.x;
        const relY = mouse.pos.y - this.board.offset.y - this.stack.offset.y;
        const coordX = this.stack.xToValue(relX);
        const coordY = this.stack.yToValue(relY);

        if (this.count === 2) {
            if (coordX && coordY) {
                this.figure.pointB = { uid: coordX, v: coordY };
                this.pb = { x: relX, y: relY };
            }
        } else if (this.count === 3 && this.pa && this.pb) {
            const y = DrawUtils.LINEAR(this.pa, this.pb, relX);
            if (this.figure) {
                this.figure.spread = y !== undefined ? relY - y : 0;
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

class EditTrendChannelState implements IStateController {
    private static inst?: EditTrendChannelState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditTrendChannelState();
        }
        return this.inst;
    }

    private last = new Point();
    private chartStack?: IChartStack;
    private figure?: TrendChannelFigureComponent;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.figure && this.chartStack) {
            // Change mouse x/y only if line was shifted. Ignoring "empty" movement.
            const shifted = this.figure.shift(mouse.pos.x - this.last.x, mouse.pos.y - this.last.y);
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
            this.figure = <TrendChannelFigureComponent>activationParameters['component'];
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

class ChannelStore {

    public get spread(): number {
        return this.container.getProperty('spread') || 0;
    }

    public set spread(value: number) {
        this.container.setProperty('spread', value);
    }

    constructor(
        private container: StoreContainer
    ) {
    }
}
