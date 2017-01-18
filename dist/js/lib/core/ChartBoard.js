/**
 * ChartBoard class.
 *
 * @classdesc Facade for the chart library.
 */
"use strict";
var render_1 = require("../render");
var Enums_1 = require("./Enums");
var axes_1 = require("../axes");
var ChartArea_1 = require("./ChartArea");
var ChartStack_1 = require("./ChartStack");
var $ = require("jquery");
var ChartBoard = (function () {
    function ChartBoard(container, w, h, dataSource) {
        this.container = container;
        this.w = w;
        this.h = h;
        this.dataSource = dataSource;
        this.curInterval = Enums_1.TimeInterval.day;
        this.areas = [];
        this.chartStacks = [];
        this.indicators = [];
        this.eventHandlers = {};
        this.mouseHandlers = [];
        this.isMouseEntered = false;
        this.isMouseDown = false;
        this.x = null;
        this.y = null;
        this.table = document.createElement('table');
        this.container.appendChild(this.table);
        this.timeAxis = new axes_1.TimeAxis(w, Enums_1.TimeInterval.day, { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) });
        // Create main chart area
        //
        var mainArea = this.appendArea(this.table, w, h);
        this.areas.push(mainArea);
        var chartStack = new ChartStack_1.ChartStack(mainArea, this.timeAxis);
        this.chartStacks.push(chartStack);
        chartStack.addChart(dataSource, render_1.RenderType.Candlestick);
        // Hook up event handlers
        //
        var self = this;
        this.eventHandlers['mousewheel'] = function (event) { self.onMouseWheel(event); };
        this.eventHandlers['mouseup'] = function (event) { self.onMouseUp(event); };
        this.eventHandlers['mousedown'] = function (event) { self.onMouseDown(event); };
        this.eventHandlers['mousemove'] = function (event) { self.onMouseMove(event); };
        this.eventHandlers['mouseenter'] = function (event) { self.onMouseEnter(event); };
        this.eventHandlers['mouseleave'] = function (event) { self.onMouseLeave(event); };
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
    ChartBoard.prototype.appendArea = function (table, w, h) {
        var mainCanvas = document.createElement('canvas');
        mainCanvas.width = w;
        mainCanvas.height = h;
        var yCanvas = document.createElement('canvas');
        yCanvas.width = 50;
        yCanvas.height = h;
        var xCanvas = document.createElement('canvas');
        xCanvas.width = w;
        xCanvas.height = 50;
        var row1 = table.insertRow();
        var cell11 = row1.insertCell();
        var cell12 = row1.insertCell();
        var cell13 = row1.insertCell();
        var row2 = table.insertRow();
        var cell21 = row2.insertCell();
        var cell22 = row2.insertCell();
        var cell23 = row2.insertCell();
        var row3 = table.insertRow();
        var cell31 = row3.insertCell();
        var cell32 = row3.insertCell();
        var cell33 = row3.insertCell();
        cell22.appendChild(mainCanvas);
        cell32.appendChild(xCanvas);
        cell23.appendChild(yCanvas);
        return new ChartArea_1.ChartArea(mainCanvas, xCanvas, yCanvas);
    };
    ChartBoard.prototype.addIndicator = function (indicatorDataSource) {
        this.indicators.push(indicatorDataSource);
        var newArea = this.appendArea(this.table, this.w, this.h);
        this.areas.push(newArea);
        var chartStack = new ChartStack_1.ChartStack(newArea, this.timeAxis);
        chartStack.addChart(indicatorDataSource, render_1.RenderType.Line);
        this.chartStacks.push(chartStack);
    };
    ChartBoard.prototype.render = function () {
        for (var _i = 0, _a = this.chartStacks; _i < _a.length; _i++) {
            var chartStack = _a[_i];
            chartStack.render();
        }
    };
    ChartBoard.prototype.onDataChanged = function () {
    };
    ChartBoard.prototype.onMouseWheel = function (event) {
        var ev = event;
        if (false == !!event)
            event = window.event;
        var direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            console.debug('Mousewhell event: ' + direction);
            this.timeAxis.scale(direction);
            // TODO: Use animation loop (?)
            this.render();
        }
    };
    ChartBoard.prototype.onMouseMove = function (event) {
        if (this.isMouseDown && this.x && this.y) {
            var diffX = event.pageX - this.x;
            var diffY = event.pageY - this.y;
            if (this.timeAxis) {
                this.timeAxis.move(diffX);
            }
        }
        _a = [event.pageX, event.pageY], this.x = _a[0], this.y = _a[1];
        if (this.isMouseEntered) {
            // TODO: Use animation loop (?)
            this.render();
        }
        var _a;
    };
    ChartBoard.prototype.onMouseEnter = function (event) {
        this.isMouseEntered = true;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseEnter(event);
        }
    };
    ChartBoard.prototype.onMouseLeave = function (event) {
        this.isMouseEntered = false;
        this.isMouseDown = false;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseLeave(event);
        }
    };
    ChartBoard.prototype.onMouseUp = function (event) {
        this.isMouseDown = false;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseUp(event);
        }
    };
    ChartBoard.prototype.onMouseDown = function (event) {
        this.isMouseDown = true;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseDown(event);
        }
    };
    return ChartBoard;
}());
exports.ChartBoard = ChartBoard;
