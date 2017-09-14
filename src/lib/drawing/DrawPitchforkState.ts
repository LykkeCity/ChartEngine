/**
 * Classes for drawing pitchfork.
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

export class PitchforkFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
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
        super('Pitchfork', offset, size, container);

        this.store = new SettingStore(container);

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
            const mid = DrawUtils.MID(b, c);
            return DrawUtils.IS_POINT_ON_LINE(p, a, mid, 5)
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
        let extA = undefined;
        let mid = undefined;
        if (a && b) {
            if (c) {
                mid = DrawUtils.MID(b, c);
                extA = DrawUtils.EXTEND(a, mid, frame);
            } else {
                extA = DrawUtils.EXTEND(a, b, frame);
            }
        }

        const canvas = this.area.frontCanvas;
        canvas.setStrokeStyle(this.store.color);
        canvas.lineWidth = this.store.width;

        canvas.beginPath();
        if (a && b && !c && extA) {
            canvas.moveTo(a.x, a.y);
            canvas.lineTo(extA.x, extA.y);
        } else if (a && b && c && extA && mid) {
            // find left and right extensions
            const midAC = DrawUtils.MID(a, c);
            const midAB = DrawUtils.MID(a, b);

            // find 4th vertex of parallelogram
            const a1 = {
                x: 2 * midAC.x - mid.x,
                y: 2 * midAC.y - mid.y
            };

            const a2 = {
                x: 2 * midAB.x - mid.x,
                y: 2 * midAB.y - mid.y
            };

            // extend side lines
            const ext1 = DrawUtils.EXTEND(a1, c, frame);
            const ext2 = DrawUtils.EXTEND(a2, b, frame);

            canvas.moveTo(b.x, b.y);
            canvas.lineTo(c.x, c.y);

            // extensions
            canvas.moveTo(a.x, a.y);
            canvas.lineTo(extA.x, extA.y);

            canvas.moveTo(c.x, c.y);
            canvas.lineTo(ext1.x, ext1.y);

            canvas.moveTo(b.x, b.y);
            canvas.lineTo(ext2.x, ext2.y);
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
}

export class DrawPitchforkState extends FigureStateBase {
    public constructor() {
        super();
    }

    private board?: IChartBoard;
    private figure?: PitchforkFigureComponent;
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
            const stack = this.stack;
            let state: string;
            let figure: PitchforkFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <PitchforkFigureComponent>stack.addFigure(FigureType.pitchfork);
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

class EditPitchforkState extends FigureEditStateBase {
    private static inst?: EditPitchforkState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditPitchforkState();
        }
        return this.inst;
    }

    private figure?: PitchforkFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <PitchforkFigureComponent>activationParameters['component'];

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
