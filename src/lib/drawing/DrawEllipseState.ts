/**
 * Classes for drawing ellipses.
 */

import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class EllipseFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new EllipseSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private pc: PointFigureComponent;
    private pd: PointFigureComponent;
    private r1: number = 0;
    //private r2: number = 0;
    private angle: number = 0;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;
    private store: EllipseStore;

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

    public get radiusB(): number {
        return this.store.radiusB;
    }

    public set radiusB(value: number) {
        this.store.radiusB = value;
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
        super('Ellipse', offset, size, container);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('a'));
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('b'));
        this.pc = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, undefined, true);
        this.pd = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, undefined, true);
        this.addChild(this.pa);
        this.addChild(this.pb);
        this.addChild(this.pc);
        this.addChild(this.pd);

        this.store = new EllipseStore(container);
        // recompute points after loading figure
        this.updatePoints();

        this.subscribe();
    }

    public isHit(p: IPoint): boolean {
        let point = p;
        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const angle = DrawUtils.ANGLE(a, b);
            const mid = DrawUtils.MID(a, b);
            const r1 = DrawUtils.DIST(a, b) / 2;
            const r2 = this.store.radiusB;

            // transfer to (0,0)
            point = { x: p.x - mid.x, y: p.y - mid.y };

            // rotate
            point = { x: point.x * Math.cos(angle) + point.y * Math.sin(angle),
                      y: -point.x * Math.sin(angle) + point.y * Math.cos(angle) };

            const res = (r1 !== 0 && r2 !== 0)
                ? (point.x * point.x) / (r1 * r1) + (point.y * point.y) / (r2 * r2)
                : 0;

            return res > 0.7 && res < 1.3;
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

        this.updatePoints();
        // const c = this.pc.shift(dx, dy);
        // const d = this.pd.shift(dx, dy);
        return a || b;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        const a = this.pa.getXY();
        const b = this.pb.getXY();
        const r2 = this.store.radiusB;

        const canvas = this.area.frontCanvas;

        if (a && b && r2) {
            // update computed points' coordinates
            this.updatePoints();

            const angle = DrawUtils.ANGLE(a, b);
            const dist = DrawUtils.DIST(a, b);
            const mid = DrawUtils.MID(a, b);

            canvas.beginPath();
            canvas.setStrokeStyle(this.settings.color);
            canvas.lineWidth = this.settings.width;
            canvas.ellipse(mid.x, mid.y, dist / 2, r2, angle, 0, 2 * Math.PI);
            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditEllipseState.instance;
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

    private computeRadius(p: IPoint): number|undefined {
        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            return DrawUtils.DIST_TO_LINE(p, a, b);
        }
    }

    private getTimeRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.uid !== undefined && this.pb.point.uid !== undefined && this.pc.point.uid !== undefined && this.pd.point.uid !== undefined) {
            return {
                start: Uid.min(this.pa.point.uid, this.pb.point.uid, this.pc.point.uid, this.pd.point.uid),
                end: Uid.max(this.pa.point.uid, this.pb.point.uid, this.pc.point.uid, this.pd.point.uid)
            };
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.v !== undefined && this.pb.point.v !== undefined && this.pc.point.v !== undefined && this.pd.point.v !== undefined) {
            return {
                start: Math.min(this.pa.point.v, this.pb.point.v, this.pc.point.v, this.pd.point.v),
                end: Math.max(this.pa.point.v, this.pb.point.v, this.pc.point.v, this.pd.point.v)
            };
        }
    }

    private subscribe(sub: boolean = true) {
        if (sub) {
            this.pa.changed.on(this.onPointChanged);
            this.pb.changed.on(this.onPointChanged);
            this.pc.changed.on(this.onP3changed);
            this.pd.changed.on(this.onP4changed);
        } else {
            this.pa.changed.off(this.onPointChanged);
            this.pb.changed.off(this.onPointChanged);
            this.pc.changed.off(this.onP3changed);
            this.pd.changed.off(this.onP4changed);
        }
    }

    private onPointChanged = () => {
        this.updatePoints();
    }

    private onP3changed = () => {
        const updRadius = this.computeRadius(this.pc.pixel);
        this.store.radiusB = updRadius || this.store.radiusB;
        this.updatePoints();
    }

    private onP4changed = () => {
        const updRadius = this.computeRadius(this.pd.pixel);
        this.store.radiusB = updRadius || this.store.radiusB;
        this.updatePoints();
    }

    private updatePoints() {
        this.subscribe(false); // prevent change events while recomputing

        // Update p3, p4
        const r2 = this.store.radiusB;
        const y1 = r2;
        const y2 = -r2;

        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const angle = DrawUtils.ANGLE(a, b);
            const mid = DrawUtils.MID(a, b);

            // rotate
            const rotp1 = { x: y1 * Math.sin(-angle),
                           y: y1 * Math.cos(-angle) };
            const rotp2 = { x: y2 * Math.sin(-angle),
                           y: y2 * Math.cos(-angle) };

            // transfer
            const tp1 = { x: rotp1.x + mid.x, y: rotp1.y + mid.y };
            const tp2 = { x: rotp2.x + mid.x, y: rotp2.y + mid.y };

            this.pc.pixel = { x: tp1.x, y: tp1.y };
            this.pd.pixel = { x: tp2.x, y: tp2.y };
        }
        this.subscribe();
    }
}

export class EllipseSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawEllipseState extends FigureStateBase {
    private static inst?: DrawEllipseState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawEllipseState();
        }
        return this.inst;
    }

    private board?: IChartBoard;
    private figure?: EllipseFigureComponent;
    private pa?: IPoint;
    private pb?: IPoint;
    private count = 0;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.board = board;
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
            this.figure = <EllipseFigureComponent>this.stack.addFigure(FigureType.ellipse);

            this.figure.pointA = { uid: coordX, v: coordY };
            this.pa = { x: relX, y: relY };
        } else if (this.count === 1) {
            if (this.figure) {
                this.figure.pointB = { uid: coordX, v: coordY };
            }
            this.pb = { x: relX, y: relY };
        } else if (this.count === 2 && this.pa && this.pb) {
            const dist = DrawUtils.DIST_TO_LINE({ x: relX, y: relY }, this.pa, this.pb);
            if (this.figure) {
                this.figure.radiusB = dist;
                // this.figure.pointB.uid = coordX;
                // this.figure.pointB.v = coordY;
            }
        } else if (this.count > 2) {
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
            const dist = DrawUtils.DIST_TO_LINE({ x: relX, y: relY }, this.pa, this.pb);
            if (this.figure) {
                this.figure.radiusB = dist;
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

class EditEllipseState extends FigureEditStateBase {
    private static inst?: EditEllipseState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditEllipseState();
        }
        return this.inst;
    }

    private figure?: EllipseFigureComponent;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (activationParameters && activationParameters['component']) {
            this.figure = <EllipseFigureComponent>activationParameters['component'];
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

class EllipseStore {

    public get radiusB(): number {
        return this.container.getProperty('point') || 0;
    }

    public set radiusB(value: number) {
        this.container.setProperty('point', value);
    }

    constructor(
        private container: StoreContainer
    ) {
    }
}
