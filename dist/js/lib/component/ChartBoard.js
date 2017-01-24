/**
 * ChartBoard class.
 *
 * @classdesc Facade for the chart library.
 */
"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var index_1 = require("../axes/index");
var index_2 = require("../canvas/index");
var index_3 = require("../core/index");
var index_4 = require("../render/index");
var index_5 = require("../shared/index");
var ChartArea_1 = require("./ChartArea");
var ChartStack_1 = require("./ChartStack");
var $ = require("jquery");
var ChartBoard = (function (_super) {
    __extends(ChartBoard, _super);
    function ChartBoard(container, w, h) {
        var _this = _super.call(this) || this;
        _this.container = container;
        _this.w = w;
        _this.h = h;
        _this.curInterval = index_3.TimeInterval.day;
        _this.areas = [];
        _this.chartStacks = [];
        _this.indicators = [];
        _this.eventHandlers = {};
        _this.mouseHandlers = [];
        _this.isMouseEntered = false;
        _this.isMouseDown = false;
        _this.mouseX = null;
        _this.mouseY = null;
        _this.table = document.createElement('table');
        _this.container.appendChild(_this.table);
        // Make place for the Time Axis
        _this.timeAxisCanvas = _this.appendTimeCanvas(_this.table, w, 25);
        _this.timeAxis = new index_1.TimeAxis(_this.timeAxisCanvas, w, index_3.TimeInterval.day, { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) });
        _this.addChild(_this.timeAxis);
        // Create main chart area
        //
        var mainArea = _this.appendArea(_this.table, w, h);
        _this.areas.push(mainArea);
        var chartStack = new ChartStack_1.ChartStack(mainArea, new index_5.Point(0, 0), _this.timeAxis);
        _this.chartStacks.push(chartStack);
        _this.addChild(chartStack);
        // Hook up event handlers
        //
        var self = _this;
        _this.eventHandlers['mousewheel'] = function (event) { self.onMouseWheel(event); };
        _this.eventHandlers['mouseup'] = function (event) { self.onMouseUp(event); };
        _this.eventHandlers['mousedown'] = function (event) { self.onMouseDown(event); };
        _this.eventHandlers['mousemove'] = function (event) { self.onMouseMove(event); };
        _this.eventHandlers['mouseenter'] = function (event) { self.onMouseEnter(event); };
        _this.eventHandlers['mouseleave'] = function (event) { self.onMouseLeave(event); };
        _this.container.addEventListener('DOMMouseScroll', _this.eventHandlers['mousewheel'], false);
        _this.container.addEventListener('mousewheel', _this.eventHandlers['mousewheel'], false);
        _this.container.addEventListener('mouseup', _this.eventHandlers['mouseup'], false);
        _this.container.addEventListener('mousedown', _this.eventHandlers['mousedown'], false);
        //this.container.addEventListener('mousemove', this.eventHandlers['mousemove'], false);
        // TODO: Check if jQuery needed:
        $(_this.container).mousemove(_this.eventHandlers['mousemove']);
        _this.container.addEventListener('mouseenter', _this.eventHandlers['mouseenter'], false);
        _this.container.addEventListener('mouseleave', _this.eventHandlers['mouseleave'], false);
        return _this;
    }
    ChartBoard.prototype.appendTimeCanvas = function (table, w, h) {
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var row = table.insertRow();
        var cell1 = row.insertCell();
        var cell2 = row.insertCell();
        var cell3 = row.insertCell();
        cell2.appendChild(canvas);
        var ctx = canvas.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new index_2.CanvasWrapper(ctx, w, h);
    };
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
    ChartBoard.prototype.addChart = function (chartType, dataSource) {
        // add event handlers
        var self = this;
        dataSource.dateChanged.on(function (arg) { self.onDataChanged(arg); });
        this.chartStacks[0].addChart(chartType, dataSource);
        // re-render charts
        this.render();
    };
    ChartBoard.prototype.addIndicator = function (indicatorDataSource) {
        this.indicators.push(indicatorDataSource);
        var yOffset = this.areas.length * this.h;
        var newArea = this.appendArea(this.table, this.w, this.h);
        this.areas.push(newArea);
        var chartStack = new ChartStack_1.ChartStack(newArea, new index_5.Point(0, yOffset), this.timeAxis);
        chartStack.addChart(index_3.ChartType.line, indicatorDataSource);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);
    };
    ChartBoard.prototype.render = function () {
        // Prepare rendering objects: locator and context.
        var locator = index_4.RenderLocator.Instance;
        var context = new index_3.VisualContext((this.mouseX && this.mouseY) ? new index_5.Point(this.mouseX, this.mouseY) : undefined);
        // Clear canvas
        this.timeAxisCanvas.clear();
        // // Render all chart stacks
        // for (const chartStack of this.chartStacks) {
        //     chartStack.render(context, locator);
        // }
        // // Render time axis as it does not belong to any chart
        // this.timeAxis.render(context, locator);
        _super.prototype.render.call(this, context, locator);
    };
    // public render(renderLocator: IRenderLocator) {
    // }
    ChartBoard.prototype.onDataChanged = function (arg) {
        this.render();
    };
    // TODO: Make mouse events handlers private
    //
    ChartBoard.prototype.onMouseWheel = function (event) {
        //let ev = event;
        if (false == !!event) {
            event = window.event;
        }
        var direction = ((event.wheelDelta) ? event.wheelDelta / 120 : event.detail / -3) || 0;
        if (direction) {
            console.debug('Mousewhell event: ' + direction);
            this.timeAxis.scale(direction);
            // TODO: Use animation loop (?)
            this.render();
        }
    };
    ChartBoard.prototype.onMouseMove = function (event) {
        //super.onMouseMove(event);
        if (this.isMouseDown && this.mouseX && this.mouseY) {
            var diffX = event.pageX - this.mouseX;
            var diffY = event.pageY - this.mouseY;
            if (this.timeAxis) {
                this.timeAxis.move(diffX);
            }
        }
        _a = [event.pageX, event.pageY], this.mouseX = _a[0], this.mouseY = _a[1];
        if (this.isMouseEntered) {
        }
        var _a;
    };
    ChartBoard.prototype.onMouseEnter = function (event) {
        //super.onMouseEnter(event);
        this.isMouseEntered = true;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseEnter(event);
        }
    };
    ChartBoard.prototype.onMouseLeave = function (event) {
        //super.onMouseLeave(event);
        this.isMouseEntered = false;
        this.isMouseDown = false;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseLeave(event);
        }
    };
    ChartBoard.prototype.onMouseUp = function (event) {
        //super.onMouseUp(event);
        this.isMouseDown = false;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseUp(event);
        }
    };
    ChartBoard.prototype.onMouseDown = function (event) {
        //super.onMouseDown(event);
        this.isMouseDown = true;
        for (var _i = 0, _a = this.mouseHandlers; _i < _a.length; _i++) {
            var handler = _a[_i];
            handler.onMouseDown(event);
        }
    };
    return ChartBoard;
}(index_3.VisualComponent));
exports.ChartBoard = ChartBoard;
