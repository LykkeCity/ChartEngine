define(["require", "exports", "core/Enums", "core/CanvasWrapper", "core/TimeAxis", "charts/renderers/CandlestickChartRenderer", "charts/renderers/LineChartRenderer", "charts/renderers/AxisRenderer", "jquery"], function (require, exports, Enums_1, CanvasWrapper_1, TimeAxis_1, CandlestickChartRenderer_1, LineChartRenderer_1, AxisRenderer_1, $) {
    "use strict";
    var RenderType;
    (function (RenderType) {
        RenderType[RenderType["Candlestick"] = 0] = "Candlestick";
        RenderType[RenderType["Line"] = 1] = "Line";
    })(RenderType || (RenderType = {}));
    var ChartArea = (function () {
        function ChartArea(mainCanvas, axisXCanvas, axisYCanvas) {
            this.mainCanvas = mainCanvas;
            this.axisXCanvas = axisXCanvas;
            this.axisYCanvas = axisYCanvas;
            this._mainContext = this.getContext(mainCanvas, mainCanvas.width, mainCanvas.height);
            this._axisXContext = this.getContext(axisXCanvas, axisXCanvas.width, axisXCanvas.height);
            this._axisYContext = this.getContext(axisYCanvas, axisYCanvas.width, axisYCanvas.height);
        }
        Object.defineProperty(ChartArea.prototype, "mainContext", {
            get: function () {
                return this._mainContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChartArea.prototype, "axisXContext", {
            get: function () {
                return this._axisXContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ChartArea.prototype, "axisYContext", {
            get: function () {
                return this._axisYContext;
            },
            enumerable: true,
            configurable: true
        });
        ChartArea.prototype.getContext = function (el, w, h) {
            var ctx = el.getContext("2d");
            if (ctx == null) {
                throw new Error("Context is null");
            }
            return new CanvasWrapper_1.CanvasWrapper(ctx, w, h);
        };
        return ChartArea;
    }());
    var Chart = (function () {
        function Chart(dataSource, renderType) {
            this.dataSource = dataSource;
            this.renderType = renderType;
        }
        return Chart;
    }());
    var ChartStack = (function () {
        function ChartStack(area, timeAxis) {
            this.area = area;
            this.timeAxis = timeAxis;
            this.charts = [];
        }
        ChartStack.prototype.addChart = function (dataSource, renderType) {
            var newChart = new Chart(dataSource, renderType);
            this.charts.push(newChart);
        };
        ChartStack.prototype.render = function () {
            this.area.mainContext.clear();
            this.area.axisXContext.clear();
            this.area.axisYContext.clear();
            var height = this.area.axisYContext.h;
            for (var _i = 0, _a = this.charts; _i < _a.length; _i++) {
                var chart = _a[_i];
                var data = chart.dataSource.getData(this.timeAxis.range);
                var yAxis = new TimeAxis_1.NumberAxis(height, 1, { start: data.minOrdinateValue, end: data.maxOrdinateValue });
                if (chart.renderType == RenderType.Candlestick) {
                    var candleRender = new CandlestickChartRenderer_1.CandlestickChartRenderer();
                    candleRender.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
                }
                else if (chart.renderType == RenderType.Line) {
                    LineChartRenderer_1.LineChartRenderer.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
                }
                else {
                    throw new Error("Unexpected RenderType " + chart.renderType);
                }
            }
            // render axis
            AxisRenderer_1.AxisRenderer.renderDateAxis(this.timeAxis, this.area.axisXContext);
        };
        return ChartStack;
    }());
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
            this.timeAxis = new TimeAxis_1.TimeAxis(w, Enums_1.TimeInterval.day, { start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) });
            // Create main chart area
            //
            var mainArea = this.appendArea(this.table, w, h);
            this.areas.push(mainArea);
            var chartStack = new ChartStack(mainArea, this.timeAxis);
            this.chartStacks.push(chartStack);
            chartStack.addChart(dataSource, RenderType.Candlestick);
            // Hook up event handlers
            //
            var self = this;
            this.eventHandlers["mousewheel"] = function (event) { self.onMouseWheel(event); };
            this.eventHandlers["mouseup"] = function (event) { self.onMouseUp(event); };
            this.eventHandlers["mousedown"] = function (event) { self.onMouseDown(event); };
            this.eventHandlers["mousemove"] = function (event) { self.onMouseMove(event); };
            this.eventHandlers["mouseenter"] = function (event) { self.onMouseEnter(event); };
            this.eventHandlers["mouseleave"] = function (event) { self.onMouseLeave(event); };
            this.container.addEventListener("DOMMouseScroll", this.eventHandlers["mousewheel"], false);
            this.container.addEventListener("mousewheel", this.eventHandlers["mousewheel"], false);
            this.container.addEventListener("mouseup", this.eventHandlers["mouseup"], false);
            this.container.addEventListener("mousedown", this.eventHandlers["mousedown"], false);
            //this.container.addEventListener("mousemove", this.eventHandlers["mousemove"], false);
            // TODO: Check if jQuery needed:
            $(this.container).mousemove(this.eventHandlers["mousemove"]);
            this.container.addEventListener("mouseenter", this.eventHandlers["mouseenter"], false);
            this.container.addEventListener("mouseleave", this.eventHandlers["mouseleave"], false);
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
            return new ChartArea(mainCanvas, xCanvas, yCanvas);
        };
        ChartBoard.prototype.addIndicator = function (indicatorDataSource) {
            this.indicators.push(indicatorDataSource);
            var newArea = this.appendArea(this.table, this.w, this.h);
            this.areas.push(newArea);
            var chartStack = new ChartStack(newArea, this.timeAxis);
            chartStack.addChart(indicatorDataSource, RenderType.Line);
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
                console.debug("Mousewhell event: " + direction);
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
});
