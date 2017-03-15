/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */
import { TimeAxis } from '../axes/index';
import { TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, IDataSource, IDataSourceUntyped } from '../data/index';
import { IMouseHandler } from '../interaction/index';
import { BoardArea } from '../layout/index';
import { Point } from '../model/index';
import { RenderLocator } from '../render/index';
import { IEventHandler, IHashTable, Point as IPoint } from '../shared/index';
import { ChartStack } from './ChartStack';
import { TimeAxisComponent } from './TimeAxisComponent';

import * as $ from 'jquery';

export class ChartBoard extends VisualComponent {

    private readonly area: BoardArea;
    private readonly chartStacks: ChartStack[] = [];
    private readonly timeAxis: TimeAxis;
    private readonly timeAxisComponent: TimeAxisComponent;

    private readonly dataSources: IHashTable<IDataSourceUntyped> = { };

    private readonly eventHandlers: IHashTable<IEventHandler<any>> = {};
    private readonly mouseHandlers: IMouseHandler[] = [];

    constructor(
        private readonly container: HTMLElement,
        private readonly offsetLeft: number,
        private readonly offsetTop: number,
        w: number,
        h: number,
        interval: TimeInterval
    ) {
        super({ x: 0, y: 0}, { width: Math.max(w, 100), height: Math.max(h, 50)});

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
        const self = this;
        this.eventHandlers['mousewheel'] = function (event: any) { self.onMouseWheel(event); };
        this.eventHandlers['mouseup'] = function (event: any) { self.onMouseUp(event); };
        this.eventHandlers['mousedown'] = function (event: any) { self.onMouseDown(event); };
        this.eventHandlers['mousemove'] = function (event: any) { self.onMouseMove(event); };
        this.eventHandlers['mouseenter'] = function (event: any) { self.onMouseEnter(event); };
        this.eventHandlers['mouseleave'] = function (event: any) { self.onMouseLeave(event); };

        this.container.addEventListener('DOMMouseScroll', this.eventHandlers['mousewheel'], false);
        this.container.addEventListener('mousewheel', this.eventHandlers['mousewheel'], false);
        this.container.addEventListener('mouseup', this.eventHandlers['mouseup'], false);
        this.container.addEventListener('mousedown', this.eventHandlers['mousedown'], false);
        //this.container.addEventListener('mousemove', this.eventHandlers['mousemove'], false);
        $(this.container).mousemove(this.eventHandlers['mousemove']);
        this.container.addEventListener('mouseenter', this.eventHandlers['mouseenter'], false);
        this.container.addEventListener('mouseleave', this.eventHandlers['mouseleave'], false);
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
        // this.indicators.push(indicatorDataSource);

        // const dh = Math.floor((this._size.height - this.xAxisHeight) / (this.chartStacks.length + 2));
        // const dw = this._size.width - this.yAxisWidth;

        // const yOffset = (this.chartStacks.length + 1) * dh;

        // // create new area
        // const chartArea = this.makeArea(dw, dh);
        // this.chartAreas.push(chartArea);

        // const yAxisArea = this.makeArea(this.yAxisWidth, dh);
        // this.yAxisAreas.push(yAxisArea);

        // const chartStack = new ChartStack(new IPoint(0, yOffset), { width: dw, height: dh }, this.timeAxis, false);
        // chartStack.addChart(uid, ChartType.line, indicatorDataSource);
        // this.chartStacks.push(chartStack);
        // this.addChild(chartStack);

        // this.insertRow(this.table, this.chartAreas.length - 1, undefined, chartArea, yAxisArea);

        // // change timeAxisOffset
        // const curOffset = this.timeAxisComponent.offset;
        // this.timeAxisComponent.offset = new IPoint(curOffset.x, curOffset.y + (this._size.height - this.xAxisHeight));

        // // recalculate size of all elements
        // this.resize(this._size.width, this._size.height);
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

        let mouse = undefined;
        if (this.isMouseEntered && this.mouseX && this.mouseY) {
            mouse = new IPoint(
                this.mouseX - this.offsetLeft, // - this.container.offsetLeft,
                this.mouseY - this.offsetTop); // - this.container.offsetTop);
        }

        for (let i = 0; i < this.chartStacks.length; i += 1) {

            const cStack = this.chartStacks[i];

            let relativeMouse = undefined;
            // Convert mouse coords to relative
            if (mouse) {
                relativeMouse = new IPoint(mouse.x - cStack.offset.x, mouse.y - cStack.offset.y);
            }

            // Prepare rendering objects: locator and context.
            let context: VisualContext = new VisualContext(
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

    public onMouseWheel(event: any): void {
        //let ev = event;
        if (false == !!event) { event = window.event; }

        const direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            this.timeAxis.scale(direction);
            // TODO: Use animation loop (?)
            this.render();
        }
    }

    private isMouseEntered = false;
    private isMouseDown = false;
    private mouseX: number | null = null;
    private mouseY: number | null = null;

    public onMouseMove(event: any): void {
        //super.onMouseMove(event);

        if (this.isMouseDown && this.mouseX && this.mouseY) {
            const diffX = event.pageX - this.mouseX;

            if (this.timeAxis) {
                this.timeAxis.move(diffX);
            }
        }

        [this.mouseX, this.mouseY] = [event.pageX, event.pageY];

        if (this.isMouseEntered && this.isMouseDown) {
            // TODO: Use animation loop (?)
            this.renderLayers(true, true);
        } else if (this.isMouseEntered) {
            this.renderLayers(false, true);
        }
    }

    public onMouseEnter(event: any): void {
        //super.onMouseEnter(event);

        this.isMouseEntered = true;
        for (const handler of this.mouseHandlers) { handler.onMouseEnter(event); }
    }

    public onMouseLeave(event: any): void {
        //super.onMouseLeave(event);

        this.isMouseEntered = false;
        this.isMouseDown = false;
        for (const handler of this.mouseHandlers) { handler.onMouseLeave(event); }
    }

    public onMouseUp(event: any): void {
        //super.onMouseUp(event);

        this.isMouseDown = false;
        for (const handler of this.mouseHandlers) { handler.onMouseUp(event); }
    }

    public onMouseDown(event: any): void {
        //super.onMouseDown(event);

        this.isMouseDown = true;
        for (const handler of this.mouseHandlers) { handler.onMouseDown(event); }
    }
}
