/**
 * Classes for drawing trend channels.
 */

import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, Command, Constants, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class TrendChannelFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private store: SettingStore;
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

        this.store = new SettingStore(container);

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
        canvas.setStrokeStyle(this.store.color);
        canvas.lineWidth = this.store.width;

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
                    value: this.store.color.toString(),
                    settingType: SettingType.color,
                    displayName: 'Color'
                }, {
                    name: 'width',
                    value: this.store.width.toString(),
                    settingType: SettingType.numeric,
                    displayName: 'Width'
                }
            ]
        });
    }

    public setSettings(value: SettingSet): void {
        this.store.color = value.getValueOrDefault<string>('line.color', this.store.color);
        this.store.width = value.getValueOrDefault<number>('line.width', this.store.width);
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

export class DrawTrendChannelState extends FigureStateBase {
    public constructor() {
        super();
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

    protected addPoint(point: IPoint): void {
        if (!this.board || !this.stack) {
            return;
        }

        const relX = point.x - this.board.offset.x - this.stack.offset.x;
        const relY = point.y - this.board.offset.y - this.stack.offset.y;
        const coordX = this.stack.xToValue(relX);
        const coordY = this.stack.yToValue(relY);

        if (this.count === 0) {

            const stack = this.stack;
            let state: string;
            let figure: TrendChannelFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <TrendChannelFigureComponent>stack.addFigure(FigureType.trendchannel);
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
                this.figure.pointA = { uid: coordX, v: coordY };
                this.pa = { x: relX, y: relY };
            }

            this.board.treeChangedEvt.trigger();
        } else if (this.count === 1 && this.figure) {
            this.figure.pointB = { uid: coordX, v: coordY };
            this.pb = { x: relX, y: relY };
        } else if (this.count === 2 && this.figure && this.pa && this.pb) {
            const y = DrawUtils.LINEAR(this.pa, this.pb, relX);
            this.figure.spread = y !== undefined ? relY - y : 0;

            // this.figure.pointC = { uid: coordX, v: coordY };
            // this.pb = { x: relX, y: relY };
        } else if (this.count === 3) {
            this.exit();
        }

        this.count += 1;
    }

    protected setLastPoint(point: IPoint): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        const relX = point.x - this.board.offset.x - this.stack.offset.x;
        const relY = point.y - this.board.offset.y - this.stack.offset.y;
        const coordX = this.stack.xToValue(relX);
        const coordY = this.stack.yToValue(relY);

        if (this.count === 2) {
            if (coordX && coordY) {
                this.figure.pointB = { uid: coordX, v: coordY };
                this.pb = { x: relX, y: relY };
            }
        } else if (this.count === 3 && this.pa && this.pb) {
            const y = DrawUtils.LINEAR(this.pa, this.pb, relX);
            this.figure.spread = y !== undefined ? relY - y : 0;
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

class EditTrendChannelState extends FigureEditStateBase {
    private static inst?: EditTrendChannelState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditTrendChannelState();
        }
        return this.inst;
    }

    private figure?: TrendChannelFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <TrendChannelFigureComponent>activationParameters['component'];

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

    public get spread(): number {
        return this.container.getProperty('spread') || 0;
    }

    public set spread(value: number) {
        this.container.setProperty('spread', value);
    }

    public get color(): string {
        return this.container.getProperty('color') || Constants.DEFAULT_FORECOLOR;
    }

    public set color(value: string) {
        this.container.setProperty('color', value);
    }

    public get width(): number {
        return this.container.getProperty('width') || 1;
    }

    public set width(value: number) {
        this.container.setProperty('width', value);
    }

    constructor(
        private container: StoreContainer
    ) {
        // write initial values
        this.width = this.width;
        this.color = this.color;
        this.spread = this.spread;
    }
}
