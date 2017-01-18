/**
 * ChartBoard class.
 * 
 * @classdesc Facade for the chart library.
 */

import { RenderType } from '../render';
import { TimeInterval } from './Enums';
import { TimeAxis } from '../axes';
import { ChartArea } from './ChartArea';
import { ChartStack } from './ChartStack';
import { IDataSource } from '../data';
import { Candlestick, Point } from '../model';
import { IEventHandler, IHashTable } from '../shared';
import { IMouseHandler } from '../interaction';
import * as $ from 'jquery';

export class ChartBoard {

    private table: HTMLTableElement;
    private curInterval: TimeInterval = TimeInterval.day;
    private timeAxis: TimeAxis;

    private readonly areas: ChartArea[] = [];
    private readonly chartStacks: ChartStack[] = [];

    private readonly indicators: IDataSource<Point>[] = [];

    private eventHandlers: IHashTable<IEventHandler<any>> = {};
    private readonly mouseHandlers: IMouseHandler[] = [];

    constructor(
        private readonly container: HTMLElement,
        private readonly w: number,
        private readonly h: number,
        private readonly dataSource: IDataSource<Candlestick>
    ) {

        this.table = document.createElement('table');
        this.container.appendChild(this.table);

        this.timeAxis = new TimeAxis(w, TimeInterval.day, { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) })

        // Create main chart area
        //
        let mainArea = this.appendArea(this.table, w, h);
        this.areas.push(mainArea);

        let chartStack = new ChartStack(mainArea, this.timeAxis);
        this.chartStacks.push(chartStack);

        chartStack.addChart(dataSource, RenderType.Candlestick);

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
    
    public addIndicator(indicatorDataSource: IDataSource<Point>) {
        this.indicators.push(indicatorDataSource);

        let newArea = this.appendArea(this.table, this.w, this.h);
        this.areas.push(newArea);

        let chartStack = new ChartStack(newArea, this.timeAxis);
        chartStack.addChart(indicatorDataSource, RenderType.Line);
        this.chartStacks.push(chartStack);
    }

    public render(): void {
        for (var chartStack of this.chartStacks) {
            chartStack.render();
        }
        
    }

    private onDataChanged(): void {

    }

    private onMouseWheel(event: any): void {
        var ev = event;
        if (false == !!event) event = window.event;

        var direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            console.debug('Mousewhell event: ' + direction);
            this.timeAxis.scale(direction);
            // TODO: Use animation loop (?)
            this.render();
        }
    }

    private isMouseEntered = false;
    private isMouseDown = false;
    private x: number | null = null;
    private y: number | null = null;

    private onMouseMove(event: any): void {
        if (this.isMouseDown && this.x && this.y) {
            let diffX = event.pageX - this.x;
            let diffY = event.pageY - this.y;

            if (this.timeAxis) {
                this.timeAxis.move(diffX);
            }
        }

        [this.x, this.y] = [event.pageX, event.pageY];

        if (this.isMouseEntered) {
            // TODO: Use animation loop (?)
            this.render();
        }
    }

    private onMouseEnter(event: any): void {
        this.isMouseEntered = true;
        for (var handler of this.mouseHandlers) { handler.onMouseEnter(event); }
    }

    private onMouseLeave(event: any): void {
        this.isMouseEntered = false;
        this.isMouseDown = false;
        for (var handler of this.mouseHandlers) { handler.onMouseLeave(event); }
    }

    private onMouseUp(event: any): void {
        this.isMouseDown = false;        
        for (var handler of this.mouseHandlers) { handler.onMouseUp(event); }
    }

    private onMouseDown(event: any): void {
        this.isMouseDown = true;        
        for (var handler of this.mouseHandlers) { handler.onMouseDown(event); }
    }
}
