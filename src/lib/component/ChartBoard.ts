/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */

import { IAxis, NumberAxis, PriceAxis, TimeAxis } from '../axes/index';
import { CanvasWrapper, ICanvas } from '../canvas/index';
import { ChartType, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { DataChangedArgument, IDataSource } from '../data/index';
import { IMouseHandler } from '../interaction/index';
import { Candlestick, Point } from '../model/index';
import { IRenderLocator, RenderLocator, RenderType } from '../render/index';
import { IEventHandler, IHashTable, Point as IPoint } from '../shared/index';
import { ChartArea } from './ChartArea';
import { ChartStack } from './ChartStack';
import { NumberMarker } from './NumberMarker';
import { PriceMarker } from './PriceMarker';
import { TimeMarker } from './TimeMarker';

import * as $ from 'jquery';

export class ChartBoard extends VisualComponent {

    private table: HTMLTableElement;

    private readonly chartAreas: ChartArea[] = [];
    private readonly chartStacks: ChartStack[] = [];
    private readonly yAxisAreas: ChartArea[] = [];
    private readonly yAxes: any[] = [];

    private timeAxis: TimeAxis;
    private timeArea: ChartArea;

    private readonly indicators: IDataSource<Point>[] = [];

    private eventHandlers: IHashTable<IEventHandler<any>> = {};
    private readonly mouseHandlers: IMouseHandler[] = [];

    constructor(
        private readonly container: HTMLElement,
        private readonly offsetLeft: number,
        private readonly offsetTop: number,
        private readonly w: number,
        private readonly h: number
    ) {
        super({ x: 0, y: 0}, { width: w, height: h});

        this.table = document.createElement('table');
        this.table.style.setProperty('position', 'relative');
        this.table.style.setProperty('border-spacing', '0');
        this.table.style.setProperty('border-collapse', 'collapse');
        this.container.appendChild(this.table);

        this.timeArea = this.makeArea(w, 25);

        const now = new Date();
        this.timeAxis = new TimeAxis(
            { x: 0, y: h}, // offset
            { width: this.timeArea.width, height: this.timeArea.height}, // size
            TimeInterval.day, { start: new Date(2017, 0, 1), end: now });
        this.addChild(this.timeAxis);

        const timeMarker = new TimeMarker({ x: 0, y: 0 }, this.timeAxis.size, this.timeAxis);
        this.timeAxis.addChild(timeMarker);

        // Create main chart area
        //
        const chartArea = this.makeArea(w, h);
        this.chartAreas.push(chartArea);

        const yAxisArea = this.makeArea(50, h);
        this.yAxisAreas.push(yAxisArea);

        // create initial Y axis
        const yAxis = new PriceAxis(
            { x: chartArea.width, y: 0 },                         // offset
            { width: yAxisArea.width, height: yAxisArea.height }, // size
            0.0005);
        this.yAxes.push(yAxis);
        this.addChild(yAxis);

        const priceMarker = new PriceMarker({x: 0, y: 0}, yAxis.size, yAxis);
        yAxis.addChild(priceMarker);

        // Add main chart stack
        const chartStack = new ChartStack(new IPoint(0, 0), { width: w, height: h }, this.timeAxis, yAxis);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        this.insertRow(this.table, 0, undefined, chartArea, yAxisArea);
        this.insertRow(this.table, undefined, undefined, this.timeArea, undefined);

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

    private insertRow(table: HTMLTableElement, index?: number, el1?: ChartArea, el2?: ChartArea, el3?: ChartArea) {
        const row = table.insertRow(index);
        const cell1 = row.insertCell();
        const cell2 = row.insertCell();
        const cell3 = row.insertCell();
        cell1.style.setProperty('padding', '0');
        cell2.style.setProperty('padding', '0');
        cell3.style.setProperty('padding', '0');

        const div1 = document.createElement('div');
        const div2 = document.createElement('div');
        const div3 = document.createElement('div');

        div1.style.setProperty('position', 'relative');
        div1.style.setProperty('height', el1 ? el1.height + 'px' : '');
        div1.style.setProperty('width', el1 ? el1.width + 'px' : '');
        div2.style.setProperty('position', 'relative');
        div2.style.setProperty('height', el2 ? el2.height + 'px' : '');
        div2.style.setProperty('width', el2 ? el2.width + 'px' : '');
        div3.style.setProperty('position', 'relative');
        div3.style.setProperty('height', el3 ? el3.height + 'px' : '');
        div3.style.setProperty('width', el3 ? el3.width + 'px' : '');

        cell1.appendChild(div1);
        cell2.appendChild(div2);
        cell3.appendChild(div3);

        if (el1) { div1.appendChild(el1.baseCanvas); div1.appendChild(el1.frontCanvas); }
        if (el2) { div2.appendChild(el2.baseCanvas); div2.appendChild(el2.frontCanvas); }
        if (el3) { div3.appendChild(el3.baseCanvas); div3.appendChild(el3.frontCanvas); }
    }

    private makeArea(w: number, h: number) : ChartArea {

        let baseCanvas = document.createElement('canvas');
        baseCanvas.width = w;
        baseCanvas.height = h;
        baseCanvas.style.setProperty('left', '0');
        baseCanvas.style.setProperty('top', '0');
        baseCanvas.style.setProperty('z-index', '0');
        baseCanvas.style.setProperty('position', 'absolute');

        let frontCanvas = document.createElement('canvas');
        frontCanvas.width = w;
        frontCanvas.height = h;
        frontCanvas.style.setProperty('left', '0');
        frontCanvas.style.setProperty('top', '0');
        frontCanvas.style.setProperty('z-index', '1');
        frontCanvas.style.setProperty('position', 'absolute');

        return new ChartArea(w, h, baseCanvas, frontCanvas);
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

        const yOffset = this.chartAreas.length * this.h;

        // create new area
        const chartArea = this.makeArea(this.w, this.h);
        this.chartAreas.push(chartArea);

        const yAxisArea = this.makeArea(50, this.h);
        this.yAxisAreas.push(yAxisArea);

        // create Y axis
        const yAxis = new NumberAxis(
            { x: chartArea.width, y: yOffset },                   // offset
            { width: yAxisArea.width, height: yAxisArea.height }, // size
            0.0005);
        this.yAxes.push(yAxis);
        this.addChild(yAxis);

        const numberMarker = new NumberMarker({x: 0, y: 0}, yAxis.size, yAxis);
        yAxis.addChild(numberMarker);

        const chartStack = new ChartStack(new IPoint(0, yOffset), { width: this.w, height: this.h }, this.timeAxis, yAxis);
        chartStack.addChart(ChartType.line, indicatorDataSource);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);

        this.insertRow(this.table, this.chartAreas.length - 1, undefined, chartArea, yAxisArea);

        // change timeAxisOffset
        const curOffset = this.timeAxis.offset;
        this.timeAxis.offset = new IPoint(curOffset.x, curOffset.y + this.h);
    }

    public render(): void {
        this.renderLayers(true, true);
    }

    private renderLayers(renderBase: boolean, renderFront: boolean): void {
        renderBase = renderBase === undefined ? true : renderBase;
        renderFront = renderFront === undefined ? true : renderFront;

        let mouse = undefined;
        if (this.isMouseEntered && this.mouseX && this.mouseY) {
            mouse = new IPoint(
                this.mouseX - this.offsetLeft - this.container.offsetLeft,
                this.mouseY - this.offsetTop - this.container.offsetTop);
        }

        for (let i = 0; i < this.chartStacks.length; i += 1) {

            const cStack = this.chartStacks[i];
            const area = this.chartAreas[i];
            const yAxis = this.yAxes[i];
            const yAxisArea = this.yAxisAreas[i];

            if (renderBase) {
                // clear base layer
                area.mainContext.clear();
                yAxisArea.mainContext.clear();
            }
            if (renderFront) {
                area.frontContext.clear();
                yAxisArea.frontContext.clear();
            }

            let relativeMouse = undefined;
            // Convert mouse coords to relative
            if (mouse) {
                relativeMouse = new IPoint(mouse.x - cStack.offset.x, mouse.y - cStack.offset.y);
            }

            // Prepare rendering objects: locator and context.
            let context: VisualContext = new VisualContext(
                renderBase,
                renderFront,
                area.mainContext,
                area.frontContext,
                relativeMouse);

            cStack.render(context, RenderLocator.Instance);

            context = new VisualContext(
                renderBase,
                renderFront,
                yAxisArea.mainContext,
                yAxisArea.frontContext,
                relativeMouse);
            if (mouse) {
                relativeMouse = new IPoint(mouse.x - yAxis.offset.x, mouse.y - yAxis.offset.y);
            }

            yAxis.render(context, RenderLocator.Instance);
        }

        // Do not rerender time axis when rendering only front.
        if (renderBase) {
            // Clear canvas
            this.timeArea.mainContext.clear();
        }
        if (renderFront) {
            this.timeArea.frontContext.clear();
        }

        let relativeMouse = undefined;
        // Convert mouse coords to relative
        if (mouse) {
            relativeMouse = new IPoint(mouse.x - this.timeAxis.offset.x, mouse.y - this.timeAxis.offset.y);
        }

        const context: VisualContext = new VisualContext(
            renderBase,
            renderFront,
            this.timeArea.mainContext,
            this.timeArea.frontContext,
            relativeMouse);

        this.timeAxis.render(context, RenderLocator.Instance);
    }

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
