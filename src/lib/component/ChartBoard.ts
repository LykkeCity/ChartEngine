/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */
import { TimeAxis } from '../axes/index';
import { ChartType, Mouse, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, IDataSource, IDataSourceUntyped } from '../data/index';
import { BoardArea } from '../layout/index';
import { Point } from '../model/index';
import { RenderLocator } from '../render/index';
import { IHashTable, Point as IPoint } from '../shared/index';
import { ChartStack } from './ChartStack';
import { HoverState, MoveChartState } from './InputControllerState';
import { IChartBoard, IDrawing, isStateController, IStateController } from './Interfaces';
import { StateFabric } from './StateFabric';
import { TimeAxisComponent } from './TimeAxisComponent';

import * as $ from 'jquery';

export class ChartBoard extends VisualComponent implements IDrawing, IChartBoard {

    private readonly area: BoardArea;
    private readonly chartStacks: ChartStack[] = [];
    private readonly timeAxis: TimeAxis;
    private readonly timeAxisComponent: TimeAxisComponent;

    private readonly dataSources: IHashTable<IDataSourceUntyped> = { };
    private readonly indicators: IHashTable<IDataSourceUntyped> = { };

    private state: IStateController;

    constructor(
        private readonly container: HTMLElement,
        private readonly offsetLeft: number,
        private readonly offsetTop: number,
        w: number,
        h: number,
        interval: TimeInterval
    ) {
        super({ x: offsetLeft, y: offsetTop}, { width: Math.max(w, 100), height: Math.max(h, 50)});

        this.area = new BoardArea(container, this._size);

        const start = new Date();
        start.setUTCHours(start.getUTCHours() - 2);
        const now = new Date();
        this.timeAxis = new TimeAxis(this.area.timeAxisLength, interval, { start: start, end: now });

        this.timeAxisComponent = new TimeAxisComponent(this.area, this.timeAxis);
        this.addChild(this.timeAxisComponent);

        // Create main chart area
        //
        const chartStack = new ChartStack(this.area, this.timeAxis, true);
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

        // Register states and go to default state
        StateFabric.instance.setState('hover', HoverState.instance);
        StateFabric.instance.setState('movechart', MoveChartState.instance);

        this.state = HoverState.instance;
    }

    public addChart<T>(uid: string, chartType: string, dataSource: IDataSource<T>) {
        this.dataSources[uid] = dataSource;
        // add event handlers
        dataSource.dateChanged.on(this.onDataChanged);
        this.chartStacks[0].addChart(uid, chartType, dataSource);
        // re-render charts
        this.render();
    }

    public removeChart(uid: string) {
        // get data source
        const dataSource = this.dataSources[uid];
        if (dataSource) {
            dataSource.dateChanged.off(this.onDataChanged);
            this.chartStacks[0].removeChart(uid);
        }
        // re-render charts
        this.render();
    }

    public addIndicator(uid: string, indicatorDataSource: IDataSource<Point>) {
        this.indicators[uid] = indicatorDataSource;

        const chartStack = new ChartStack(this.area, this.timeAxis, true);
        chartStack.addChart(uid, ChartType.line, indicatorDataSource);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        // recalculate size of all elements
        this.resize(this._size.width, this._size.height);

        this.render();
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

        let mouse;// = { x: this.mouse.x, y: this.mouse.y };
        if (this.mouse.isEntered && this.mouse.x && this.mouse.y) {
            mouse = new IPoint(
                this.mouse.x - this.offsetLeft, // - this.container.offsetLeft,
                this.mouse.y - this.offsetTop); // - this.container.offsetTop);
        }

        for (const cStack of this.chartStacks) {

            let relativeMouse = undefined;
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

        let relativeMouse = undefined;
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

        this.timeAxis.length = this.area.timeAxisLength;
    }

    public setTimeInterval(interval: TimeInterval) {
        if (interval) {
            this.timeAxis.interval = interval;
        }
    }

    private onDataChanged = (arg: DataChangedArgument) => {

        // Check if need to automove time range
        if (arg.lastDateBefore && arg.lastDateAfter
            && this.timeAxis.contains(arg.lastDateBefore)
            && !this.timeAxis.contains(arg.lastDateAfter)) {
            this.timeAxis.moveTo(arg.lastDateAfter);
        }

        this.render();
    }

    private onMouseWheel = (event: any) => {
        if (false == !!event) { event = window.event; }

        this.state.onMouseWheel(this, event);

        const direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            this.timeAxis.scale(direction);
            this.render();
        }
    }

    private mouse: Mouse = new Mouse();

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
        if (this.timeAxis) {
            this.timeAxis.move(diffX);
        }
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
