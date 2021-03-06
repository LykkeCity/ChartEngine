/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */
import { ChartType, Command, EventArgument, Events, ICommand, IDataService, ISource, IQuicktip, IQuicktipBuilder, isConfigurable, isStateful, IStorage, ITouch, Mouse, MouseEventArgument, ObjectEventArgument, SettingSet, StorageManager, StoreContainer, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, DataSourceFactory, DataSourceRegister, IDataSource, IndicatorDataSource } from '../data/index';
import { IndicatorFabric } from '../indicator/index';
import { BoardArea } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { RenderLocator } from '../render/index';
import { Event, IEvent, IHashTable, IPoint, IRange, Point, throttle } from '../shared/index';
import { DateUtils, IGhostClickSuppressor, TouchUtils, UidUtils } from '../utils/index';
import { ChartStack } from './ChartStack';
import { IChartBoard, IChartStack, IDrawing, IHistory, isSelectable, isStateController, IStateController } from './Interfaces';
import { StateFabric } from './StateFabric';
import { HoverState, MoveChartState } from './States';
import { LoadRangeArgument, TimeAxis } from './TimeAxis';
import { TimeAxisComponent } from './TimeAxisComponent';

import * as hjs from 'hammerjs';
import * as $ from 'jquery';

class IndicatorDescription {
    public uid: string;
    public indicatorType: string;
    constructor(uid: string, indicatorType: string) {
        this.uid = uid;
        this.indicatorType = indicatorType;
    }
}

export class ChartBoard extends VisualComponent implements IChartBoard, IDrawing, IHistory, ISource {

    private readonly area: BoardArea;
    private readonly chartStacks: ChartStack[] = [];
    private readonly timeAxis: TimeAxis;
    private readonly timeAxisComponent: TimeAxisComponent;

    private originalUid: string = '';
    private originalName: string = '';
    private originalDataSource: IDataSource<Candlestick>;
    private primaryDataSource: IDataSource<Candlestick>;
    private readonly dataSources: IHashTable<IDataSource<Candlestick>> = { };
    private readonly indicators: IHashTable<IDataSource<Candlestick>> = { };
    private readonly indicatorDescriptions: IndicatorDescription[][] = [];
    private readonly dataSourceRegister = new DataSourceRegister();

    private events = new Events();
    private commands = new CommandHistory();
    private stateFabric = new StateFabric();
    private state: IStateController;
    private storageMgr: StorageManager;
    private dataService?: IDataService;
    private timeRange: IRange<Date>;
    private hammer: HammerManager;
    private isDestroyed = false;
    private ghostClickSuppressor: IGhostClickSuppressor;
    private touchMode = false;

    // Public Events
    public get selectionChanged(): IEvent<ObjectEventArgument> {
        return this.events.selectionChanged;
    }

    public get treeChanged(): IEvent<EventArgument> {
        return this.events.treeChanged;
    }

    public get historyChanged(): IEvent<EventArgument> {
        return this.events.historyChanged;
    }

    // -- End of "Public Events" --

    // TODO: Make internal, accessible only to States.
    public get treeChangedEvt(): Event<EventArgument> {
        return this.events.treeChanged;
    }

    constructor(
        private readonly container: HTMLElement,
        offsetLeft: number,
        offsetTop: number,
        w: number,
        h: number,
        interval: TimeInterval,
        storage?: IStorage,
        dataService?: IDataService
    ) {
        super({ x: offsetLeft, y: offsetTop}, { width: Math.max(w, 100), height: Math.max(h, 50)});

        const N = 5;
        this.storageMgr = new StorageManager(storage);
        this.dataService = dataService;
        this.area = new BoardArea(container, this._size);

        const start = new Date();
        start.setUTCHours(start.getUTCHours() - 2);
        const now = new Date();

        this.timeRange = { start: start, end: now };
        this.timeAxis = new TimeAxis(interval, now, N, this.area.chartLength);
        this.timeAxis.loadingRange.on(this.onLoadingRange);

        this.timeAxisComponent = new TimeAxisComponent(this.area, this.timeAxis);
        this.addChild(this.timeAxisComponent);

        // Create main chart area.
        // Create empty store container as the asset pair is not set yet.
        const chartStack = new ChartStack(UidUtils.NEWUID(), this.area, this.timeAxis, true, this.events, new StoreContainer(), this);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        // tune touch events
        this.ghostClickSuppressor = TouchUtils.PREVENT_GHOST_CLICK(this.container);

        // Hook up event handlers
        //
        this.hammer = new Hammer(container, {});

        this.hammer.get('pinch').set({ enable: true });

        this.hammer.on('pinch', this.onTouchPinch);
        this.hammer.on('pan', this.onTouchPan);
        this.hammer.on('tap', this.onTouchTap);
        this.hammer.on('press', this.onTouchPress);
        this.hammer.on('swipe', this.onTouchSwipe);

        this.container.addEventListener('DOMMouseScroll', this.onMouseWheel, false);
        this.container.addEventListener('mousewheel', this.onMouseWheel, false);
        this.container.addEventListener('mouseup', this.onMouseUp, false);
        this.container.addEventListener('mousedown', this.onMouseDown, false);
        this.container.addEventListener('mouseenter', this.onMouseEnter, false);
        this.container.addEventListener('mouseleave', this.onMouseLeave, false);
        $(this.container).mousemove(throttle(this.onMouseMove, 10));
        $(this.container).on('touchstart', this.onTouchStart);
        $(this.container).on('touchend', this.onTouchEnd);
        $(this.container).on('touchcancel', this.onTouchCancel);

        // Go to default state
        this.state = this.stateFabric.getState('hover');
    }

    public get stacks(): IChartStack[] {
        return this.chartStacks.slice();
    }

    public getObjectById(uid: string): any|undefined {
        for (const stack of this.chartStacks) {
            if (stack.uid === uid) {
                return stack;
            }
            for (const chart of stack.charts) {
                if (chart.uid === uid) {
                    return chart;
                }
            }
            for (const figure of stack.figures) {
                if (figure.uid === uid) {
                    return figure;
                }
            }
        }
    }

    public getObjectSettings(uid: string): SettingSet|undefined {
        const obj = this.getObjectById(uid);
        if (obj && obj.uid && obj.uid === uid && isConfigurable(obj)) {
            return obj.getSettings();
        }
    }

    public setObjectSettings(uid: string, settings: SettingSet): void {
        const obj = this.getObjectById(uid);
        if (obj && obj.uid && obj.uid === uid && isConfigurable(obj)) {
            if (isStateful(obj)) {
                let state: string;
                this.push2history(
                    new Command(
                        () => {
                            state = obj.getState();
                            obj.setSettings(settings);
                        },
                        () => {
                            if (state) {
                                obj.restore(state);
                            }
                        }
                    )
                    .execute()
                );
            } else {
                obj.setSettings(settings);
            }
        }
    }

    public removeObject(uid: string): void {
        const stack = this.chartStacks.filter(s => s.contains(uid))[0];
        if (stack) {
            let state: string;
            this.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        stack.removeFigure(uid);
                    },
                    () => { // undo
                        if (state) {
                            stack.restore(state);
                        }
                    }
                )
                .execute()
            );
        }

        this.events.treeChanged.trigger();

        this.renderLayers(false, true);
    }

    public moveUp(uid: string) {
        const stack = this.chartStacks.filter(s => s.contains(uid))[0];
        if (stack) {
            let state: string;
            this.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        stack.moveUp(uid);
                    },
                    () => { // undo
                        if (state) { stack.restore(state); }
                    }
                )
                .execute()
            );
        }
        this.renderLayers(false, true);
    }

    public moveDown(uid: string) {
        const stack = this.chartStacks.filter(s => s.contains(uid))[0];
        if (stack) {
            let state: string;
            this.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        stack.moveDown(uid);
                    },
                    () => { // undo
                        if (state) { stack.restore(state); }
                    }
                )
                .execute()
            );
        }
        this.renderLayers(false, true);
    }

    public moveTop(uid: string) {
        const stack = this.chartStacks.filter(s => s.contains(uid))[0];
        if (stack) {
            let state: string;
            this.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        stack.moveTop(uid);
                    },
                    () => { // undo
                        if (state) { stack.restore(state); }
                    }
                )
                .execute()
            );
        }
        this.renderLayers(false, true);
    }

    public moveBottom(uid: string) {
        const stack = this.chartStacks.filter(s => s.contains(uid))[0];
        if (stack) {
            let state: string;
            this.push2history(
                new Command(
                    () => { // do
                        state = stack.getState();
                        stack.moveBottom(uid);
                    },
                    () => { // undo
                        if (state) { stack.restore(state); }
                    }
                )
                .execute()
            );
        }
        this.renderLayers(false, true);
    }

    public addChart<T>(uid: string, name: string, chartType: string, dataSource: IDataSource<Candlestick>) {
        // Preload data range
        dataSource.loadRange(this.timeAxis.range.start, this.timeAxis.range.end);

        // TODO: Store original datasource
        const ctx = this.createContext(this.dataService);
        dataSource = DataSourceFactory.CREATE(chartType, dataSource, this.timeRange, ctx);

        this.dataSourceRegister.register(uid, dataSource);
        this.insertChart(uid, name, chartType, dataSource);

        // re-render charts
        this.render();
    }

    private insertChart<T>(uid: string, name: string, chartType: string, dataSource: IDataSource<Candlestick>) {

        this.dataSources[uid] = dataSource;
        // add event handlers
        dataSource.dataChanged.on(this.onDataChanged);
        this.chartStacks[0].addChart(uid, name, chartType, dataSource);
    }

    private deleteChart(uid: string) {
        // get data source
        const dataSource = this.dataSources[uid];
        if (dataSource) {
            dataSource.dataChanged.off(this.onDataChanged);
            // TODO: Chart can be not only on first stack
            this.chartStacks[0].removeChart(uid);
        }
        // // re-render charts
        // this.render();
    }

    public setDataSource(uid: string, name: string, chartType: string, dataSource: IDataSource<Candlestick>) {

        this.originalDataSource = dataSource;
        this.originalUid = uid;
        this.originalName = name;

        const ctx = this.createContext(this.dataService);
        dataSource = DataSourceFactory.CREATE(chartType, dataSource, this.timeRange, ctx);

        this.timeAxis.setDataSource(dataSource);

        const stackStorage = this.getStackStorage(uid, 0);
        this.chartStacks[0].setStore(stackStorage);

        // replace primary data source
        this.deleteChart('primary-data-source');
        this.insertChart<Candlestick>('primary-data-source', name, chartType, dataSource);
        this.primaryDataSource = dataSource;

        // remove existing indicators and recreate on base of new data source.
        this.indicatorDescriptions.forEach((array, stackIndex) => {
            array.forEach((desc, index) => {
                this.deleteIndicator(desc.uid);
                this.insertIndicator(desc.uid, desc.indicatorType, stackIndex);
            });
        });

        // re-render charts
        this.resize(this._size.width, this._size.height);
        this.render();
    }

    public setChartType(chartType: string) {
        if (this.originalDataSource) {
            this.setDataSource(this.originalUid, this.originalName, chartType, this.originalDataSource); // keep figures
            // this.removeChart('primary-data-source');
            // this.addChart<Candlestick>('primary-data-source', chartType, this.primaryDataSource);
        }
        // TODO: Remove existing indicators and recreate on base of new data source.
    }

    public setTimeRange(range: IRange<Date>): void {
        this.timeRange = range;

        this.primaryDataSource.setTimeRange(range);
        // for (const uid of Object.keys(this.dataSources)) {
        //     const ext = this.extensions[uid];
    }

    public addIndicator(uid: string, indicatorType: string, index: number) {

        if (!this.primaryDataSource) {
            throw new Error('Primary data source is not set');
        }

        this.insertIndicator(uid, indicatorType, index);

        // Update indicator's description
        const arr = this.indicatorDescriptions[index];
        if (!arr) { this.indicatorDescriptions[index] = []; }
        this.indicatorDescriptions[index].push(new IndicatorDescription(uid, indicatorType));

        // recalculate size of all elements
        this.resize(this._size.width, this._size.height);
        this.render();
    }

    public removeIndicator(uid: string) {
        if (!uid || !this.indicators[uid]) {
            return;
        }

        this.deleteIndicator(uid);

        // remove indicator's description
        this.indicatorDescriptions.some((value, index, array) => {
            return value.some((v, i, a) => {
                if (v.uid === uid) {
                    a.splice(i, 1);
                    return true;
                }
                return false;
            });
        });

        // recalculate size of all elements
        this.resize(this._size.width, this._size.height);
        this.render();
    }

    private insertIndicator(uid: string, indicatorType: string, index: number) {
        // Create indicator
        //
        const ctx = this.createContext(this.dataService);

        const indicatorDataSource = IndicatorFabric.instance.instantiate(indicatorType, this.primaryDataSource, ctx);
        this.indicators[uid] = indicatorDataSource;
        indicatorDataSource.dataChanged.on(this.onDataChanged);

        // Update stack. Use existing or add new one.
        //
        let chartStack;
        if (index >= 0 && index < this.chartStacks.length ) {
            chartStack = this.chartStacks[index];
        } else {
            index = this.chartStacks.length;
            const stackStorage = this.getStackStorage(this.originalUid, index);
            chartStack = new ChartStack(UidUtils.NEWUID(), this.area, this.timeAxis, true, this.events, stackStorage);
            this.chartStacks.push(chartStack);
            this.addChild(chartStack);
        }

        chartStack.addChart(uid, indicatorType, indicatorType, indicatorDataSource);
    }

    private deleteIndicator(uid: string) {
        // remove indicator from board
        // ... find stack
        this.chartStacks.some((cs, stackIndex) => {
            if (cs.chartIds.indexOf(uid) !== -1) {
                cs.removeChart(uid);

                // If chart stack is empty remove it. Do not remove first stack.
                if (stackIndex !== 0 && cs.chartIds.length === 0) {
                    cs.dispose();
                    this.chartStacks.splice(stackIndex, 1);
                    this.removeChild(cs);
                }
                return true;
            }
            return false;
        });

        // remove indicator
        //
        const indicator = this.indicators[uid];
        // ... unsubscribe from events
        indicator.dataChanged.off(this.onDataChanged);

        // ... dispose indicator
        indicator.dispose();
        //this.indicators[uid] = undefined;
    }

    private getStackStorage(assetId: string, stackIndex: number): StoreContainer {
        const assets = this.storageMgr.root().getObjectProperty('assets');
        const asset = assets.getObjectProperty(assetId);
        const stacks = asset.getArrayProperty('stacks');
        const arrayStacks = stacks.asArray();
        return arrayStacks.length > 0 ? arrayStacks[0] : stacks.addItem();
    }

    private addInterval = (date: Date, times: number) => {
        return DateUtils.addInterval(date, this.timeAxis.interval, times);
    }

    public render(): void {
        this.renderLayers(true, true);
    }

    private renderLayers(renderBase: boolean, renderFront: boolean): void {
        renderBase = renderBase === undefined ? true : renderBase;
        renderFront = renderFront === undefined ? true : renderFront;

        if (renderBase) { this.area.clearBase(); }
        if (renderFront) { this.area.clearFront(); }

        // Mouse position
        const relMouse = this.mouse.isEntered ? this.mouse.pos.sub(this.offset) : undefined;

        // Render stacks
        for (const cStack of this.chartStacks) {
            // Prepare rendering objects: locator and context.
            const context: VisualContext = new VisualContext(
                renderBase,
                renderFront
                );

            cStack.render(context, RenderLocator.Instance);
        }

        // Render time axis
        const context: VisualContext = new VisualContext(
            renderBase,
            renderFront
            );
        this.timeAxisComponent.render(context, RenderLocator.Instance);

        // Swap render layers
        this.area.render();
    }

    public resize(w: number, h: number): void {
        w = Math.max(w, 100);
        h = Math.max(h, 50);

        this._size = { width: w, height: h };

        this.area.resize(w, h);

        this.timeAxis.width = this.area.chartLength;
    }

    public setTimeInterval(interval: TimeInterval) {
        if (interval) {
            this.timeAxis.interval = interval;
        }
    }

    private onDataChanged = (arg: DataChangedArgument) => {
        if (arg.lastUidBefore && arg.lastUidAfter
            && this.timeAxis.isVisible(arg.lastUidBefore)
            && !this.timeAxis.isVisible(arg.lastUidAfter)) {

            this.timeAxis.moveTo(arg.lastUidAfter);
        }

        this.render();
    }

    private onLoadingRange = (arg: LoadRangeArgument) => {
        for (const key of Object.keys(this.dataSources)) {
            if (key !== 'primary-data-source') {
                const ds = this.dataSources[key];
                if (arg.end) {
                    ds.loadRange(arg.start, arg.end);
                } else if (arg.count) {
                    ds.load(arg.start, arg.count);
                }
            }
        }
    }

    private createContext(dataService: IDataService|undefined) {
        const self = this;
        return {
            addInterval: this.addInterval,
            interval: (): TimeInterval => { return this.timeAxis.interval; },
            getCandle: (asset: string, date: Date, interval: TimeInterval) => {
                if (dataService) { return dataService.getCandle(asset, date, interval); }
                return new Promise<Candlestick>(resolve => {
                    resolve(undefined);
                });
            },
            render: () => { self.render(); },
            register: this.dataSourceRegister
        };
    }

    private mouse: Mouse = new Mouse();
    private ignoreNextMove = false;

    private onMouseWheel = (event: any) => {
        if (false == !!event) { event = window.event; }

        this.state.onMouseWheel(this, event);

        const direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            this.timeAxis.scale(direction);
            this.render();
        }
    }

    private onMouseMove = (event: any) => {

        // handle chrome behavior: click = down + move + up
        if (this.ignoreNextMove) {
            this.ignoreNextMove = false;
            return;
        }

        //console.log('mouse move');

        [this.mouse.pos.x, this.mouse.pos.y] = [event.pageX, event.pageY];

        this.state.onMouseMove(this, this.mouse);

        super.handleMouse(this.mouse.pos.x - this.offset.x, this.mouse.pos.y - this.offset.y);

        //Events.instance.mouseMove.trigger(new MouseEventArgument(this.mouse));

        if (this.mouse.isEntered && this.mouse.isDown) {
            this.renderLayers(true, true);
        } else if (this.mouse.isEntered) {
            this.renderLayers(false, true);
        }
    }

    private onMouseEnter = (event: any) => {
        this.mouse.isEntered = true;
        this.state.onMouseEnter(this, this.mouse);
    }

    private onMouseLeave = (event: any) => {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
        this.state.onMouseLeave(this, this.mouse);
    }

    private onMouseUp = (event: any) => {
        //console.log('mouse up');
        this.ignoreNextMove = true;
        this.mouse.isDown = false;
        this.state.onMouseUp(this, this.mouse);
        this.renderLayers(false, true);
    }

    private onMouseDown = (event: any) => {
        //console.log('mouse down');
        this.mouse.isDown = true;
        const hitStack = this.getHitStack(this.mouse.pos);
        this.state.onMouseDown(this, this.mouse, hitStack);
    }

    public moveX(diffX: number) {
        this.timeAxis.move(diffX);
    }

    private onTouchPinch = (ev: any) => {
        if (!this.touchMode) {
            return;
        }
        const direction = ev.deltaX;
        if (direction) {
            this.timeAxis.scale(direction);
            this.render();
        }
    }

    private onTouchPan = (ev: any) => {
        if (!this.touchMode) {
            return;
        }
        this.state.onTouchPan(this, <ITouch>ev);
        this.renderLayers(true, true);
    }

    private onTouchPress = (ev: any) => {
        if (!this.touchMode) {
            return;
        }
    }

    private onTouchTap = (ev: any) => {
        if (!this.touchMode) {
            return;
        }
        const hitStack = this.getHitStack(ev.center);
        this.state.onTouchTap(this, <ITouch>ev, hitStack);
        this.renderLayers(false, true);
    }

    private onTouchSwipe = (ev: any) => {
        if (!this.touchMode) {
            return;
        }
    }

    private onTouchStart = (ev: any) => {
        this.touchMode = true;
    }

    private onTouchEnd = (ev: any) => {
        this.touchMode = false;
        ev.preventDefault();
    }

    private onTouchCancel = (ev: any) => {
        this.touchMode = false;
    }

    private getHitStack(hit: IPoint): ChartStack | undefined {
        const localX = hit.x - this.offset.x;
        const localY = hit.y - this.offset.y;

        for (const cStack of this.chartStacks) {
            const relativeX = localX - cStack.offset.x;
            const relativeY = localY - cStack.offset.y;

            if (relativeX >= 0 && relativeX < cStack.size.width
                && relativeY >= 0 && relativeY < cStack.size.height) {
                return cStack;
            }
        }
    }

    public setCursor(style: string) {
        //this.area.setCursor(style);
        this.container.style.setProperty('cursor', style);
    }

    public get drawing(): IDrawing {
        return this;
    }

    public start(figureId: string): void {
        this.changeState(figureId);
    }

    public cancel(): void {
        this.changeState('hover');
    }

    public changeState(state: string | IStateController, activationParameters?: IHashTable<any>): void {
        let stateInstance;

        if (isStateController(state)) {
            stateInstance = state;
        } else if (typeof state === 'string') {
            stateInstance = this.stateFabric.getState(state);
        }

        if (!stateInstance) {
            throw new Error(`State is not defined for the specified stateId '${ state }'`);
        }

        const hitStack = this.getHitStack(this.mouse.pos);

        this.state.deactivate(this, this.mouse);
        this.state = stateInstance;
        this.state.activate(this, this.mouse, hitStack, activationParameters);
        //this.ignoreNextMove = false;
    }

    /**
     * "IChartBoard" implementation
     */

    public select(component: VisualComponent|undefined): void {
        if (component) {
            if (isSelectable(component)) {
                component.setSelected(true);
            }
        }

        // TODO: Pass events to state instances
        this.events.selectionChanged.trigger(new ObjectEventArgument(component));
    }

    /**
     * "ISource" implementation. Works with primary data source.
     */

    public getHHLL(uidFrom: Uid, uidTo: Uid): Candlestick|undefined {
        if (this.primaryDataSource) {
            return this.primaryDataSource.getHHLL(uidFrom, uidTo);
        }
    }

    public getLastCandle(): Candlestick|undefined {
        if (this.primaryDataSource) {
            return this.primaryDataSource.getLastCandle();
        }
    }

    public destroy(): void {
        if (this.hammer) {
            this.hammer.destroy();
        }
        if (this.ghostClickSuppressor) {
            this.ghostClickSuppressor.destroy();
        }
        this.isDestroyed = true;
    }

    public get history(): IHistory {
        return this;
    }

    /**
     * "IHistory" implementation
     */

    public get length(): number {
        return this.commands.length;
    }

    public push2history(cmd: ICommand): void {
        this.commands.push(cmd);
        this.events.historyChanged.trigger();
    }

    public undo(): void {
        const cmd = this.commands.pop();
        if (cmd) {
            cmd.undo();
            this.events.historyChanged.trigger();
        }
    }
}

class CommandHistory {
    private commands: ICommand[] = [];

    public get length(): number {
        return this.commands.length;
    }

    public push(cmd: ICommand): void {
        this.commands.push(cmd);
    }

    public pop(): ICommand|undefined {
        return this.commands.pop();
    }
}
