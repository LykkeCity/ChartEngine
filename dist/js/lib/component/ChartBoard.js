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
var index_2 = require("../core/index");
var index_3 = require("../render/index");
var index_4 = require("../shared/index");
var ChartArea_1 = require("./ChartArea");
var ChartStack_1 = require("./ChartStack");
var NumberMarker_1 = require("./NumberMarker");
var PriceMarker_1 = require("./PriceMarker");
var TimeMarker_1 = require("./TimeMarker");
var $ = require("jquery");
var ChartBoard = (function (_super) {
    __extends(ChartBoard, _super);
    function ChartBoard(container, offsetLeft, offsetTop, w, h) {
        var _this = _super.call(this, { x: 0, y: 0 }, { width: w, height: h }) || this;
        _this.container = container;
        _this.offsetLeft = offsetLeft;
        _this.offsetTop = offsetTop;
        _this.w = w;
        _this.h = h;
        _this.chartAreas = [];
        _this.chartStacks = [];
        _this.yAxisAreas = [];
        _this.yAxes = [];
        _this.indicators = [];
        _this.eventHandlers = {};
        _this.mouseHandlers = [];
        _this.isMouseEntered = false;
        _this.isMouseDown = false;
        _this.mouseX = null;
        _this.mouseY = null;
        _this.table = document.createElement('table');
        _this.table.style.setProperty('position', 'relative');
        _this.table.style.setProperty('border-spacing', '0');
        _this.table.style.setProperty('border-collapse', 'collapse');
        _this.container.appendChild(_this.table);
        _this.timeArea = _this.makeArea(w, 25);
        var now = new Date();
        _this.timeAxis = new index_1.TimeAxis({ x: 0, y: h }, // offset
        { width: _this.timeArea.width, height: _this.timeArea.height }, // size
        index_2.TimeInterval.day, { start: new Date(2017, 0, 1), end: now });
        _this.addChild(_this.timeAxis);
        var timeMarker = new TimeMarker_1.TimeMarker({ x: 0, y: 0 }, _this.timeAxis.size, _this.timeAxis);
        _this.timeAxis.addChild(timeMarker);
        // Create main chart area
        //
        var chartArea = _this.makeArea(w, h);
        _this.chartAreas.push(chartArea);
        var yAxisArea = _this.makeArea(50, h);
        _this.yAxisAreas.push(yAxisArea);
        // create initial Y axis
        var yAxis = new index_1.PriceAxis({ x: chartArea.width, y: 0 }, // offset
        { width: yAxisArea.width, height: yAxisArea.height }, // size
        0.0005);
        _this.yAxes.push(yAxis);
        _this.addChild(yAxis);
        var priceMarker = new PriceMarker_1.PriceMarker({ x: 0, y: 0 }, yAxis.size, yAxis);
        yAxis.addChild(priceMarker);
        // Add main chart stack
        var chartStack = new ChartStack_1.ChartStack(new index_4.Point(0, 0), { width: w, height: h }, _this.timeAxis, yAxis);
        _this.chartStacks.push(chartStack);
        _this.addChild(chartStack);
        _this.insertRow(_this.table, 0, undefined, chartArea, yAxisArea);
        _this.insertRow(_this.table, undefined, undefined, _this.timeArea, undefined);
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
    ChartBoard.prototype.insertRow = function (table, index, el1, el2, el3) {
        var row = table.insertRow(index);
        var cell1 = row.insertCell();
        var cell2 = row.insertCell();
        var cell3 = row.insertCell();
        cell1.style.setProperty('padding', '0');
        cell2.style.setProperty('padding', '0');
        cell3.style.setProperty('padding', '0');
        var div1 = document.createElement('div');
        var div2 = document.createElement('div');
        var div3 = document.createElement('div');
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
        if (el1) {
            div1.appendChild(el1.baseCanvas);
            div1.appendChild(el1.frontCanvas);
        }
        if (el2) {
            div2.appendChild(el2.baseCanvas);
            div2.appendChild(el2.frontCanvas);
        }
        if (el3) {
            div3.appendChild(el3.baseCanvas);
            div3.appendChild(el3.frontCanvas);
        }
    };
    ChartBoard.prototype.makeArea = function (w, h) {
        var baseCanvas = document.createElement('canvas');
        baseCanvas.width = w;
        baseCanvas.height = h;
        baseCanvas.style.setProperty('left', '0');
        baseCanvas.style.setProperty('top', '0');
        baseCanvas.style.setProperty('z-index', '0');
        baseCanvas.style.setProperty('position', 'absolute');
        var frontCanvas = document.createElement('canvas');
        frontCanvas.width = w;
        frontCanvas.height = h;
        frontCanvas.style.setProperty('left', '0');
        frontCanvas.style.setProperty('top', '0');
        frontCanvas.style.setProperty('z-index', '1');
        frontCanvas.style.setProperty('position', 'absolute');
        return new ChartArea_1.ChartArea(w, h, baseCanvas, frontCanvas);
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
        var yOffset = this.chartAreas.length * this.h;
        // create new area
        var chartArea = this.makeArea(this.w, this.h);
        this.chartAreas.push(chartArea);
        var yAxisArea = this.makeArea(50, this.h);
        this.yAxisAreas.push(yAxisArea);
        // create Y axis
        var yAxis = new index_1.NumberAxis({ x: chartArea.width, y: yOffset }, // offset
        { width: yAxisArea.width, height: yAxisArea.height }, // size
        0.0005);
        this.yAxes.push(yAxis);
        this.addChild(yAxis);
        var numberMarker = new NumberMarker_1.NumberMarker({ x: 0, y: 0 }, yAxis.size, yAxis);
        yAxis.addChild(numberMarker);
        var chartStack = new ChartStack_1.ChartStack(new index_4.Point(0, yOffset), { width: this.w, height: this.h }, this.timeAxis, yAxis);
        chartStack.addChart(index_2.ChartType.line, indicatorDataSource);
        this.chartStacks.push(chartStack);
        this.addChild(chartStack);
        this.insertRow(this.table, this.chartAreas.length - 1, undefined, chartArea, yAxisArea);
        // change timeAxisOffset
        var curOffset = this.timeAxis.offset;
        this.timeAxis.offset = new index_4.Point(curOffset.x, curOffset.y + this.h);
    };
    ChartBoard.prototype.render = function () {
        this.renderLayers(true, true);
    };
    ChartBoard.prototype.renderLayers = function (renderBase, renderFront) {
        renderBase = renderBase === undefined ? true : renderBase;
        renderFront = renderFront === undefined ? true : renderFront;
        var mouse = undefined;
        if (this.isMouseEntered && this.mouseX && this.mouseY) {
            mouse = new index_4.Point(this.mouseX - this.offsetLeft - this.container.offsetLeft, this.mouseY - this.offsetTop - this.container.offsetTop);
        }
        for (var i = 0; i < this.chartStacks.length; i += 1) {
            var cStack = this.chartStacks[i];
            var area = this.chartAreas[i];
            var yAxis = this.yAxes[i];
            var yAxisArea = this.yAxisAreas[i];
            if (renderBase) {
                // clear base layer
                area.mainContext.clear();
                yAxisArea.mainContext.clear();
            }
            if (renderFront) {
                area.frontContext.clear();
                yAxisArea.frontContext.clear();
            }
            var relativeMouse_1 = undefined;
            // Convert mouse coords to relative
            if (mouse) {
                relativeMouse_1 = new index_4.Point(mouse.x - cStack.offset.x, mouse.y - cStack.offset.y);
            }
            // Prepare rendering objects: locator and context.
            var context_1 = new index_2.VisualContext(renderBase, renderFront, area.mainContext, area.frontContext, relativeMouse_1);
            cStack.render(context_1, index_3.RenderLocator.Instance);
            context_1 = new index_2.VisualContext(renderBase, renderFront, yAxisArea.mainContext, yAxisArea.frontContext, relativeMouse_1);
            if (mouse) {
                relativeMouse_1 = new index_4.Point(mouse.x - yAxis.offset.x, mouse.y - yAxis.offset.y);
            }
            yAxis.render(context_1, index_3.RenderLocator.Instance);
        }
        // Do not rerender time axis when rendering only front.
        if (renderBase) {
            // Clear canvas
            this.timeArea.mainContext.clear();
        }
        if (renderFront) {
            this.timeArea.frontContext.clear();
        }
        var relativeMouse = undefined;
        // Convert mouse coords to relative
        if (mouse) {
            relativeMouse = new index_4.Point(mouse.x - this.timeAxis.offset.x, mouse.y - this.timeAxis.offset.y);
        }
        var context = new index_2.VisualContext(renderBase, renderFront, this.timeArea.mainContext, this.timeArea.frontContext, relativeMouse);
        this.timeAxis.render(context, index_3.RenderLocator.Instance);
    };
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
        if (this.isMouseEntered && this.isMouseDown) {
            // TODO: Use animation loop (?)
            this.renderLayers(true, true);
        }
        else if (this.isMouseEntered) {
            this.renderLayers(false, true);
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
}(index_2.VisualComponent));
exports.ChartBoard = ChartBoard;
