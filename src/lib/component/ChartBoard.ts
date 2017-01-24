/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */

import { TimeAxis } from '../axes/index';
import { CanvasWrapper, ICanvas } from '../canvas/index';
import { ChartType, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, IDataSource } from '../data/index';
import { IMouseHandler } from '../interaction/index';
import { Candlestick, Point } from '../model/index';
import { IRenderLocator, RenderLocator, RenderType } from '../render/index';
import { IEventHandler, IHashTable, Point as MousePoint } from '../shared/index';
import { ChartArea } from './ChartArea';
import { ChartStack } from './ChartStack';

import * as $ from 'jquery';

export class ChartBoard extends VisualComponent {

    private table: HTMLTableElement;
    private curInterval: TimeInterval = TimeInterval.day;
    private timeAxis: TimeAxis;
    private timeAxisCanvas: ICanvas;

    private readonly areas: ChartArea[] = [];
    private readonly chartStacks: ChartStack[] = [];

    private readonly indicators: IDataSource<Point>[] = [];

    private eventHandlers: IHashTable<IEventHandler<any>> = {};
    private readonly mouseHandlers: IMouseHandler[] = [];

    constructor(
        private readonly container: HTMLElement,
        private readonly w: number,
        private readonly h: number
        //private readonly dataSource: IDataSource<Candlestick>
    ) {
        super();

        this.table = document.createElement('table');
        this.container.appendChild(this.table);

        // Make place for the Time Axis
        this.timeAxisCanvas = this.appendTimeCanvas(this.table, w, 25);

        this.timeAxis = new TimeAxis(this.timeAxisCanvas, w, TimeInterval.day, { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) });
        this.addChild(this.timeAxis);

        // Create main chart area
        //
        let mainArea = this.appendArea(this.table, w, h);
        this.areas.push(mainArea);

        let chartStack = new ChartStack(mainArea, new MousePoint(0, 0), this.timeAxis);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        // Hook up event handlers
        //
        let self = this;

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
        // TODO: Check if jQuery needed:
        $(this.container).mousemove(this.eventHandlers['mousemove']);
        this.container.addEventListener('mouseenter', this.eventHandlers['mouseenter'], false);
        this.container.addEventListener('mouseleave', this.eventHandlers['mouseleave'], false);
    }

    private appendTimeCanvas(table: HTMLTableElement, w: number, h: number) : ICanvas {
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;

        let row = table.insertRow();
        let cell1 = row.insertCell();
        let cell2 = row.insertCell();
        let cell3 = row.insertCell();

        cell2.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new CanvasWrapper(ctx, w, h);
    }

    private appendArea(table: HTMLTableElement, w: number, h: number) : ChartArea {

        let mainCanvas = document.createElement('canvas');
        mainCanvas.width = w;
        mainCanvas.height = h;

        let yCanvas = document.createElement('canvas');
        yCanvas.width = 50;
        yCanvas.height = h;

        let xCanvas = document.createElement('canvas');
        xCanvas.width = w;
        xCanvas.height = 50;

        let row1 = table.insertRow();
        let cell11 = row1.insertCell();
        let cell12 = row1.insertCell();
        let cell13 = row1.insertCell();

        let row2 = table.insertRow();
        let cell21 = row2.insertCell();
        let cell22 = row2.insertCell();
        let cell23 = row2.insertCell();

        let row3 = table.insertRow();
        let cell31 = row3.insertCell();
        let cell32 = row3.insertCell();
        let cell33 = row3.insertCell();

        cell22.appendChild(mainCanvas);
        cell32.appendChild(xCanvas);
        cell23.appendChild(yCanvas);

        return new ChartArea(mainCanvas, xCanvas, yCanvas);
    }

    public addChart<T>(chartType: string, dataSource: IDataSource<T>) {

        // add event handlers
        let self = this;
        dataSource.dateChanged.on(function (arg: DataChangedArgument) { self.onDataChanged(arg) });

        this.chartStacks[0].addChart(chartType, dataSource);

        // re-render charts
        this.render();
    }

    public addIndicator(indicatorDataSource: IDataSource<Point>) {
        this.indicators.push(indicatorDataSource);

        const yOffset = this.areas.length * this.h;

        let newArea = this.appendArea(this.table, this.w, this.h);
        this.areas.push(newArea);

        let chartStack = new ChartStack(newArea, new MousePoint(0, yOffset), this.timeAxis);
        chartStack.addChart(ChartType.line, indicatorDataSource);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);
    }

    public render(): void {

        // Prepare rendering objects: locator and context.
        const locator: IRenderLocator = RenderLocator.Instance;
        const context: VisualContext = new VisualContext(
            (this.mouseX && this.mouseY) ? new MousePoint(this.mouseX, this.mouseY) : undefined);

        // Clear canvas
        this.timeAxisCanvas.clear();

        // // Render all chart stacks
        // for (const chartStack of this.chartStacks) {
        //     chartStack.render(context, locator);
        // }

        // // Render time axis as it does not belong to any chart
        // this.timeAxis.render(context, locator);

        super.render(context, locator);
    }

    // public render(renderLocator: IRenderLocator) {

    // }

    private onDataChanged(arg: DataChangedArgument): void {
        this.render();
    }

    // TODO: Make mouse events handlers private
    //
    public onMouseWheel(event: any): void {
        //let ev = event;
        if (false == !!event) { event = window.event; }

        const direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            console.debug('Mousewhell event: ' + direction);
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
            let diffX = event.pageX - this.mouseX;
            let diffY = event.pageY - this.mouseY;

            if (this.timeAxis) {
                this.timeAxis.move(diffX);
            }
        }

        [this.mouseX, this.mouseY] = [event.pageX, event.pageY];

        if (this.isMouseEntered) {
            // TODO: Use animation loop (?)
            // TODO: Re-render only front layer
            //this.render();
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
