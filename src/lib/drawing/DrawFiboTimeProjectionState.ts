/**
 * Classes for drawing fibonacci time projection.
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

class Line {
    constructor(uid: Uid, percentage: number) {
        this.uid = uid;
        this.percentage = percentage;
    }
    public uid: Uid;
    public percentage: number;
}

export class FiboTimeProjectionFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private store: SettingStore;
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;
    private lines: Line[] = [];

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

    constructor(
        private area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>,
        container: StoreContainer
        ) {
        super('Fibo Time Projection', offset, size, container);

        this.store = new SettingStore(container);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('a'));
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis, container.getObjectProperty('b'));

        this.addChild(this.pa);
        this.addChild(this.pb);

        this.subscribe();
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

        return (a && b)
            ? DrawUtils.IS_POINT_ON_LINE(p, a, b, 5)
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
        return a || b;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        const frame = { x: this.offset.x, y: this.offset.y, w: this.size.width, h: this.size.height };

        const a = this.pa.getXY();
        const b = this.pb.getXY();

        if (a && b) {
            const minx = Math.min(a.x, b.x);
            const maxx = Math.min(a.x, b.x);

            const canvas = this.area.frontCanvas;
            canvas.setStrokeStyle(this.store.color);
            canvas.lineWidth = this.store.width;
            canvas.beginPath();

            for (const line of this.lines) {
                const x = this.taxis.toX(line.uid);
                if (x) {
                    canvas.moveTo(x, frame.y);
                    canvas.lineTo(x, frame.y + frame.h);
                }
            }
            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditFiboTimeProjectionState.instance;
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

        // rerender
        //this.context.render();
    }

    private subscribe(sub: boolean = true) {
        if (sub) {
            this.pa.changed.on(this.onPointChanged);
            this.pb.changed.on(this.onPointChanged);
        } else {
            this.pa.changed.off(this.onPointChanged);
            this.pb.changed.off(this.onPointChanged);
        }
    }

    private onPointChanged = () => {
        this.updateLines();
    }

    private updateLines() {
        this.subscribe(false); // prevent change events while recomputing

        this.lines = [];
        if (this.pa.point.uid && this.pb.point.uid) {

            const uidStart = this.pa.point.uid.compare(this.pb.point.uid) <= 0 ? this.pa.point.uid : this.pb.point.uid;
            const uidEnd = this.pa.point.uid.compare(this.pb.point.uid) <= 0 ? this.pb.point.uid : this.pa.point.uid;

            let dist100 = this.taxis.dist(this.pa.point.uid, this.pb.point.uid);
            if (dist100 !== undefined) {
                dist100 = Math.abs(dist100);
                const percantage = [
                    0,
                    Constants.FIBO_PERCENTAGE[1],
                    Constants.FIBO_PERCENTAGE[2],
                    Constants.FIBO_PERCENTAGE[3],
                    Constants.FIBO_PERCENTAGE[6]
                ];

                for (const perc of percantage) {
                    const shift = Math.floor(dist100 * perc);
                    const uid = this.taxis.add(uidStart, shift);
                    if (uid) {
                        this.lines.push(new Line(uid, perc));
                    }
                }
            }
        }

        this.subscribe();
    }
}

export class DrawFiboTimeProjectionState extends FigureStateBase {
    public constructor() {
        super();
    }

    private board?: IChartBoard;
    private figure?: FiboTimeProjectionFigureComponent;
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

        if (this.count > 1) {
            this.exit();
            return;
        }

        const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
        const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

        if (this.count === 0) {
            const stack = this.stack;
            let state: string;
            let figure: FiboTimeProjectionFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <FiboTimeProjectionFigureComponent>stack.addFigure(FigureType.fibotimeprojection);
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
                this.figure.pointB = { uid: coordX, v: coordY };
            }

            this.board.treeChangedEvt.trigger();
        } else if (this.count === 1 && this.figure) {
            this.figure.pointB = { uid: coordX, v: coordY };
        }

        this.count += 1;
    }

    protected setLastPoint(point: IPoint): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        if (this.count === 2) {
            const coordX = this.stack.xToValue(point.x - this.board.offset.x - this.stack.offset.x);
            const coordY = this.stack.yToValue(point.y - this.board.offset.y - this.stack.offset.y);

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

class EditFiboTimeProjectionState extends FigureEditStateBase {
    private static inst?: EditFiboTimeProjectionState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditFiboTimeProjectionState();
        }
        return this.inst;
    }

    private figure?: FiboTimeProjectionFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <FiboTimeProjectionFigureComponent>activationParameters['component'];

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
    }
}
