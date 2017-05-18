/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */
import { ChartType, IQuicktip, IQuicktipBuilder, IStorage, Mouse, Storage, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, DataSourceFactory, IDataSource } from '../data/index';
import { IndicatorDataSource, IndicatorFabric } from '../indicator/index';
import { BoardArea } from '../layout/index';
import { Candlestick, Point } from '../model/index';
import { RenderLocator } from '../render/index';
import { IHashTable, IRange, Point as IPoint } from '../shared/index';
import { DateUtils, UidUtils } from '../utils/index';
import { ChartStack } from './ChartStack';
import { IChartBoard, IDrawing, isStateController, IStateController } from './Interfaces';
import { StateFabric } from './StateFabric';
import { HoverState, MoveChartState } from './States';
import { TimeAxis } from './TimeAxis';
import { TimeAxisComponent } from './TimeAxisComponent';

import * as $ from 'jquery';

class IndicatorDescription {
    public uid: string;
    public indicatorType: string;
    constructor(uid: string, indicatorType: string) {
        this.uid = uid;
        this.indicatorType = indicatorType;
    }
}

export class ChartBoard extends VisualComponent implements IDrawing, IChartBoard {

    private readonly area: BoardArea;
    private readonly chartStacks: ChartStack[] = [];
    private readonly timeAxis: TimeAxis;
    private readonly timeAxisComponent: TimeAxisComponent;

    private originalName: string;
    private originalDataSource: IDataSource<Candlestick>;
    private primaryDataSource: IDataSource<Candlestick>;
    private readonly dataSources: IHashTable<IDataSource<Candlestick>> = { };
    private readonly indicators: IHashTable<IDataSource<Candlestick>> = { };
    private readonly indicatorDescriptions: IndicatorDescription[][] = [];

    private state: IStateController;
    private storage: Storage;
    protected timeRange: IRange<Date>;

    constructor(
        private readonly container: HTMLElement,
        offsetLeft: number,
        offsetTop: number,
        w: number,
        h: number,
        interval: TimeInterval,
        storage?: IStorage
    ) {
        super({ x: offsetLeft, y: offsetTop}, { width: Math.max(w, 100), height: Math.max(h, 50)});

        const N = 5;
        this.storage = new Storage(storage);
        this.area = new BoardArea(container, this._size);

        const start = new Date();
        start.setUTCHours(start.getUTCHours() - 2);
        const now = new Date();

        this.timeRange = { start: start, end: now };
        this.timeAxis = new TimeAxis(interval, now, N, this.area.chartLength);

        this.timeAxisComponent = new TimeAxisComponent(this.area, this.timeAxis);
        this.addChild(this.timeAxisComponent);

        // Create main chart area
        //
        const chartStack = new ChartStack(UidUtils.NEWUID(), this.area, this.timeAxis, true);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        // Hook up event handlers
        //
        this.container.addEventListener('DOMMouseScroll', this.onMouseWheel, false);
        this.container.addEventListener('mousewheel', this.onMouseWheel, false);
        this.container.addEventListener('mouseup', this.onMouseUp, false);
        this.container.addEventListener('mousedown', this.onMouseDown, false);
        //this.container.addEventListener('mousemove', this.onMouseMove, false);
        $(this.container).mousemove(this.onMouseMove);
        this.container.addEventListener('mouseenter', this.onMouseEnter, false);
        this.container.addEventListener('mouseleave', this.onMouseLeave, false);

        // Go to default state
        this.state = HoverState.instance;
    }

    public get stacks(): ChartStack[] {
        return this.chartStacks.slice();
    }

    public addChart<T>(uid: string, name: string, chartType: string, dataSource: IDataSource<Candlestick>) {
        // TODO: Store original datasource
        dataSource = DataSourceFactory.CREATE(chartType, dataSource, this.timeRange);

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

    private removeChart(uid: string) {
        // get data source
        const dataSource = this.dataSources[uid];
        if (dataSource) {
            dataSource.dataChanged.off(this.onDataChanged);
            this.chartStacks[0].removeChart(uid);
        }
        // // re-render charts
        // this.render();
    }

    public setDataSource(name: string, chartType: string, dataSource: IDataSource<Candlestick>, keepFigures: boolean) {

        this.originalDataSource = dataSource;
        this.originalName = name;

        // TODO: Store original datasource
        dataSource = DataSourceFactory.CREATE(chartType, dataSource, this.timeRange);

        this.timeAxis.setDataSource(dataSource);

        // remove figures
        if (!keepFigures) {
            this.chartStacks.forEach(cs => cs.removeFigures());
        }

        // replace primary data source
        this.removeChart('primary-data-source');
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
            this.setDataSource(this.originalName, chartType, this.originalDataSource, true); // keep figures
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
        const indicatorDataSource = IndicatorFabric.instance.instantiate(indicatorType, this.primaryDataSource, this.addInterval);
        this.indicators[uid] = indicatorDataSource;
        indicatorDataSource.dataChanged.on(this.onDataChanged);

        // Update stack. Use existing or add new one.
        //
        let chartStack;
        if (index >= 0 && index < this.chartStacks.length ) {
            chartStack = this.chartStacks[index];
        } else {
            index = this.chartStacks.length;
            chartStack = new ChartStack(UidUtils.NEWUID(), this.area, this.timeAxis, true);
            chartStack.setFixedRange({ start: -10, end: 110});
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

    private addInterval = (date: Date, times: number) => {
        return DateUtils.addInterval(date, this.timeAxis.interval, times);
    }

    public render(): void {
        this.renderLayers(true, true);
    }

    private renderLayers(renderBase: boolean, renderFront: boolean): void {
        renderBase = renderBase === undefined ? true : renderBase;
        renderFront = renderFront === undefined ? true : renderFront;

        if (renderBase) {
            this.area.clearBase();
        }
        if (renderFront) {
            this.area.clearFront();
        }

        let mouse; // = { x: this.mouse.x, y: this.mouse.y };
        if (this.mouse.isEntered && this.mouse.x && this.mouse.y) {
            mouse = new IPoint(
                this.mouse.x - this.offset.x, // - this.container.offsetLeft,
                this.mouse.y - this.offset.y); // - this.container.offsetTop);
        }

        for (const cStack of this.chartStacks) {

            let relativeMouse: IPoint | undefined;
            // Convert mouse coords to relative
            if (mouse) {
                relativeMouse = new IPoint(mouse.x - cStack.offset.x, mouse.y - cStack.offset.y);
            }

            // Prepare rendering objects: locator and context.
            const context: VisualContext = new VisualContext(
                renderBase,
                renderFront,
                relativeMouse);

            cStack.render(context, RenderLocator.Instance);
        }

        let relativeMouse: IPoint | undefined;
        // Convert mouse coords to relative
        if (mouse) {
            relativeMouse = new IPoint(mouse.x - this.timeAxisComponent.offset.x, mouse.y - this.timeAxisComponent.offset.y);
        }

        const context: VisualContext = new VisualContext(
            renderBase,
            renderFront,
            relativeMouse);

        this.timeAxisComponent.render(context, RenderLocator.Instance);
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

        // Check if need to automove time range
        // if (arg.lastDateBefore && arg.lastDateAfter
        //     && this.frame.contains(arg.lastDateBefore)
        //     && !this.frame.contains(arg.lastDateAfter)) {

        //     //this.frame.moveTo(arg.lastDateAfter);
        // }
        //this.frame.automove(arg);

        this.render();
    }

    private mouse: Mouse = new Mouse();

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
        [this.mouse.x, this.mouse.y] = [event.pageX, event.pageY]; // [event.pageX - this.offset.x, event.pageY - this.offset.y];

        this.state.onMouseMove(this, this.mouse);

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
        this.mouse.isDown = false;
        this.state.onMouseUp(this, this.mouse);
    }

    private onMouseDown = (event: any) => {
        this.mouse.isDown = true;
        this.state.onMouseDown(this, this.mouse);
    }

    public moveX(diffX: number) {
        //if (this.timeAxis) {
            this.timeAxis.move(diffX);
        //}
    }

    public getHitStack(localX: number, localY: number): ChartStack | undefined {
        if (!localX || !localY) {
            return undefined;
        }

        for (const cStack of this.chartStacks) {
            const relativeX = localX - cStack.offset.x;
            const relativeY = localY - cStack.offset.y;

            if (relativeX >= 0 && relativeX < cStack.size.width
                && relativeY >= 0 && relativeY < cStack.size.height) {
                return cStack;
            }
        }
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
            stateInstance = StateFabric.instance.getState(state);
        }

        if (!stateInstance) {
            throw new Error(`State is not defined for the specified stateId '${ state }'`);
        }

        this.state.deactivate(this, this.mouse);
        this.state = stateInstance;
        this.state.activate(this, this.mouse, activationParameters);
    }
}
