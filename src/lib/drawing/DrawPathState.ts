/**
 * Classes for drawing path.
 */
import { FigureComponent, FigureType, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, Command, Constants, IAxis, IChartPoint, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, Mouse, SettingSet, SettingType, StoreArray, StoreContainer, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, IPoint, IRange, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { FigureEditStateBase } from './FigureEditStateBase';
import { FigureStateBase } from './FigureStateBase';
import { PointFigureComponent } from './PointFigureComponent';

export class PathFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private store: SettingStore;
    private p: PointFigureComponent[] = [];
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;
    private _closed = false;
    private pointsStore: StoreArray;

    constructor(
        private area: ChartArea,
        offset: IPoint,
        size: ISize,
        private chartSettings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>,
        container: StoreContainer
        ) {
        super('Path', offset, size, container);

        this.store = new SettingStore(container);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, chartSettings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, chartSettings, this.getValueRange);
        this.addChild(this.valueRegion);

        // restore points
        this.pointsStore = container.getArrayProperty('points');
        for (const pStore of this.pointsStore.asArray()) {
            this.insertPoint(pStore);
            this.closed = true; // for loaded figure set close
        }
    }

    public get closed(): boolean {
        return this._closed;
    }

    public set closed(value: boolean) {
        this._closed = value;
    }

    public addPoint(uid: Uid, v: number): void {
        const pointContainer = this.pointsStore.addItem();
        const pf = this.insertPoint(pointContainer);
        pf.point = { uid: uid, v: v };
    }

    private insertPoint(container: StoreContainer): PointFigureComponent {
        const pf = new PointFigureComponent(this.area, this.offset, this.size, this.chartSettings, this.taxis, this.yaxis, container);
        this.p.push(pf);
        this.addChild(pf);
        return pf;
    }

    public getPoint(index: number): IChartPoint {
        if (index >= 0 && index < this.p.length) {
            return this.p[index].point;
        } else {
            throw new Error(`Index out of ranges ${index}. Length = ${this.p.length}`);
        }
    }

    public setPoint(index: number, v: IChartPoint): void {
        if (index >= 0 && index < this.p.length) {
            this.p[index].point = v;
        } else {
            throw new Error(`Index out of ranges ${index}. Length = ${this.p.length}`);
        }
    }

    public removePoint(index: number): void {
        if (index >= 0 && index < this.p.length) {
            // remove from store and from ponts array
            this.pointsStore.removeItem(index);
            const removed = this.p.splice(index, 1);
            this.removeChild(removed[0]);
        }
    }

    public get count(): number {
        return this.p.length;
    }

    private getTimeRange = (ctx: VisualContext, size: ISize): IRange<Uid>|undefined => {
        if (this.p.length > 0) {
            let min: Uid|undefined;
            let max: Uid|undefined;

            this.p.forEach(value => {
                const uid = value.point.uid;
                if (uid) {
                    min = min ? (min.compare(uid) <= 0 ? min : uid) : uid;
                    max = max ? (max.compare(uid) >= 0 ? max : uid) : uid;
                }
            });

            return (min && max) ? { start: min, end: max } : undefined;
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize): IRange<number>|undefined => {
        if (this.p.length > 0) {
            let min: number|undefined;
            let max: number|undefined;

            this.p.forEach(value => {
                const v = value.point.v;
                if (v) {
                    min = min ? (min <= v ? min : v) : v;
                    max = max ? (max >= v ? max : v) : v;
                }
            });

            return (min && max) ? { start: min, end: max } : undefined;
        }
    }

    public isHit(p: IPoint): boolean {
        let cur: IPoint|undefined = undefined;
        let prev: IPoint|undefined = undefined;

        // Check first last
        const hit = this.p.some(value => {
            cur = value.getXY();
            if (cur && prev) {
                if (DrawUtils.IS_POINT_ON_LINE(p, cur, prev, 5)) {
                    return true;
                }
            }
            prev = cur;
            return false;
        });

        // check last line
        if (!hit) {
            if (this.p.length > 1) {
                const first = this.p[0].getXY();
                if (cur && first) {
                    return DrawUtils.IS_POINT_ON_LINE(p, first, cur, 5);
                }
            }
        }
        return hit;
    }

    public setSelected(selected: boolean): void {
        super.setSelected(selected);
        this.valueRegion.visible = selected;
        this.timeRegion.visible = selected;
    }

    public shift(dx: number, dy: number): boolean {
        let result = false;
        this.p.forEach(point => {
            result = point.shift(dx, dy) || result;
        });
        return result;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        const canvas = this.area.frontCanvas;
        canvas.setStrokeStyle(this.store.color);
        canvas.lineWidth = this.store.width;
        canvas.beginPath();

        let prev: IPoint|undefined = undefined;
        this.p.forEach(value => {
            const cur = value.getXY();
            if (cur && prev) {
                canvas.lineTo(cur.x, cur.y);
            } else if (cur) {
                canvas.moveTo(cur.x, cur.y);
            }
            prev = cur;
            //return false;
        });

        if (this._closed) {
            canvas.closePath();
        }
        canvas.stroke();
        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditPathState.instance;
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

export class DrawPathState extends FigureStateBase {
    public constructor() {
        super();
    }

    private board?: IChartBoard;
    private figure?: PathFigureComponent;
    private firstXY?: Point;
    private lastXY?: Point;
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

        if (!coordX || coordY === undefined) {
            return;
        }

        if (this.count === 0) {
            const stack = this.stack;
            let state: string;
            let figure: PathFigureComponent|undefined;
            this.board.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        figure = <PathFigureComponent>stack.addFigure(FigureType.path);
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
                this.figure.addPoint(coordX, coordY);
                this.firstXY = new Point(relX, relY);
            }

            this.board.treeChangedEvt.trigger();
        } else {
            if (this.figure) {
                this.figure.addPoint(coordX, coordY);
                this.lastXY = new Point(relX, relY);
            }
        }

        this.count += 1;
    }

    protected fixPoint(point: IPoint): void {
        if (this.firstXY && this.lastXY && DrawUtils.IS_POINT_OVER(this.firstXY, this.lastXY, 10)) {
            // remove last point
            if (this.figure) {
                this.figure.removePoint(this.figure.count - 1);
                this.figure.closed = true;
            }
            this.exit();
            return;
        }
    }

    protected setLastPoint(point: IPoint): void {
        if (!this.board || !this.stack || !this.figure) {
            return;
        }

        const relX = point.x - this.board.offset.x - this.stack.offset.x;
        const relY = point.y - this.board.offset.y - this.stack.offset.y;
        const coordX = this.stack.xToValue(relX);
        const coordY = this.stack.yToValue(relY);

        this.lastXY = new Point(relX, relY);

        if (coordX && coordY && this.figure.count > 0) {
            this.figure.setPoint(this.figure.count - 1, { uid: coordX, v: coordY });
        }
    }

    private exit(): void {
        this.figure = undefined;
        this.stack = undefined;
        this.lastXY = undefined;
        this.firstXY = undefined;
        if (this.board) {
            this.board.changeState('hover');
        }
    }
}

class EditPathState extends FigureEditStateBase {
    private static inst?: EditPathState;
    private constructor() {
        super();
    }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditPathState();
        }
        return this.inst;
    }

    private figure?: PathFigureComponent;
    private undo?: () => void;
    private isChanged = false;

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        super.activate(board, mouse, stack, activationParameters);

        if (stack && activationParameters && activationParameters['component']) {
            this.figure = <PathFigureComponent>activationParameters['component'];

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
