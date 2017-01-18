(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Bundle = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

},{}],2:[function(require,module,exports){
"use strict";
var NumberAxis = (function () {
    function NumberAxis(width, interval, // Defines maximum zoom
        initialRange) {
        this._w = width;
        this._interval = interval;
        this._range = initialRange;
    }
    Object.defineProperty(NumberAxis.prototype, "range", {
        get: function () {
            return this._range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NumberAxis.prototype, "width", {
        get: function () {
            return this._w;
        },
        enumerable: true,
        configurable: true
    });
    NumberAxis.prototype.toX = function (value) {
        var range = Math.abs(this.range.end - this.range.start);
        var min = Math.min(this.range.end, this.range.start);
        var d = this.width / (range);
        return d * (value - min);
    };
    NumberAxis.prototype.move = function (direction) {
        direction = 0;
    };
    NumberAxis.prototype.scale = function (direction) {
        direction = 0;
    };
    return NumberAxis;
}());
exports.NumberAxis = NumberAxis;
},{}],3:[function(require,module,exports){
/**
* TimeAxis class
*
* @classdesc Represents a chart's axis of numbers
*/
"use strict";
var TimeAxis = (function () {
    function TimeAxis(width, interval, // Defines maximum zoom
        initialRange) {
        this._w = width;
        this._interval = interval;
        this._range = initialRange;
    }
    Object.defineProperty(TimeAxis.prototype, "range", {
        get: function () {
            return this._range;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeAxis.prototype, "interval", {
        get: function () {
            return this._interval;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(TimeAxis.prototype, "width", {
        get: function () {
            return this._w;
        },
        enumerable: true,
        configurable: true
    });
    TimeAxis.prototype.toX = function (value) {
        if (value < this.range.start || value > this.range.end) {
            throw new Error("Date " + value + " is out of range.");
        }
        var total = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        var toDate = Math.abs(value.getTime() - this.range.start.getTime());
        var x = (toDate / total) * this.width;
        return x;
    };
    TimeAxis.prototype.move = function (direction) {
        //direction = Math.round(direction);
        if (direction == 0) {
            return;
        }
        var curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        var shiftInMs = direction * curRangeInMs / this.width;
        this._range = {
            start: new Date(this.range.start.getTime() - shiftInMs),
            end: new Date(this.range.end.getTime() - shiftInMs)
        };
    };
    TimeAxis.prototype.scale = function (direction) {
        var curRangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime()); // current range in millisencods
        var newRange = 0;
        // Move date to the specified direction
        if (direction > 0) {
            newRange = curRangeInMs * 0.9;
            if (newRange / this.interval < 10) {
                newRange = this.interval * 10;
            }
        }
        else if (direction < 0) {
            newRange = curRangeInMs * 1.1;
            if (newRange / this.interval > 1000) {
                newRange = this.interval * 1000;
            }
        }
        this._range = {
            start: new Date(this.range.end.getTime() - newRange),
            end: this.range.end
        };
    };
    return TimeAxis;
}());
exports.TimeAxis = TimeAxis;
},{}],4:[function(require,module,exports){
"use strict";
var NumberAxis_1 = require("./NumberAxis");
exports.NumberAxis = NumberAxis_1.NumberAxis;
var TimeAxis_1 = require("./TimeAxis");
exports.TimeAxis = TimeAxis_1.TimeAxis;
},{"./NumberAxis":2,"./TimeAxis":3}],5:[function(require,module,exports){
/**
* CanvasWrapper class.
*
* @classdesc Incapsulates usage of canvas.
*/
"use strict";
var Enums_1 = require("./Enums");
var CanvasWrapper = (function () {
    function CanvasWrapper(context, width, height) {
        this.ctx = context;
        this.w = width;
        this.h = height;
        this.dpr = 1;
        //this.ctx.translate(0.5, 0.5);
        //this.ressize(width, height);
    }
    CanvasWrapper.prototype.clear = function () {
        this.ctx.clearRect(0, 0, this.w, this.h);
    };
    CanvasWrapper.prototype.moveTo = function (x, y) {
        this.ctx.moveTo(x * this.dpr, y * this.dpr);
    };
    CanvasWrapper.prototype.lineTo = function (x, y) {
        this.ctx.lineTo(x * this.dpr, y * this.dpr);
    };
    CanvasWrapper.prototype.fillText = function (s, x, y) {
        this.ctx.fillText(s, x * this.dpr, y * this.dpr);
    };
    CanvasWrapper.prototype.fillRect = function (x, y, w, h) {
        this.ctx.fillRect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    };
    CanvasWrapper.prototype.strokeRect = function (x, y, w, h) {
        this.ctx.strokeRect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    };
    // Used with beginPath() / stroke() / strokeStyle / fill()
    CanvasWrapper.prototype.rect = function (x, y, w, h) {
        this.ctx.rect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    };
    CanvasWrapper.prototype.beginPath = function () {
        this.ctx.beginPath();
    };
    CanvasWrapper.prototype.stroke = function () {
        this.ctx.stroke();
    };
    CanvasWrapper.prototype.closePath = function () {
        this.ctx.closePath();
    };
    CanvasWrapper.prototype.setStrokeStyle = function (style) {
        this.ctx.strokeStyle = style;
    };
    CanvasWrapper.prototype.setFillStyle = function (style) {
        this.ctx.fillStyle = style;
    };
    CanvasWrapper.prototype.setTextAlign = function (v) {
        this.ctx.textAlign = Enums_1.CanvasTextBaseLine[v].toLowerCase();
    };
    CanvasWrapper.prototype.setTextBaseLine = function (v) {
        this.ctx.textBaseline = Enums_1.CanvasTextBaseLine[v].toLowerCase();
    };
    CanvasWrapper.prototype.measureText = function (text) {
        return this.ctx.measureText(text);
    };
    CanvasWrapper.prototype.strokeText = function (text, x, y, maxWidth) {
        this.ctx.strokeText(text, x, y, maxWidth);
    };
    return CanvasWrapper;
}());
exports.CanvasWrapper = CanvasWrapper;
},{"./Enums":6}],6:[function(require,module,exports){
/**
* Canvas related enumerations.
*/
"use strict";
var CanvasTextAlign;
(function (CanvasTextAlign) {
    CanvasTextAlign[CanvasTextAlign["Left"] = 0] = "Left";
    CanvasTextAlign[CanvasTextAlign["Center"] = 1] = "Center";
    CanvasTextAlign[CanvasTextAlign["Right"] = 2] = "Right";
})(CanvasTextAlign = exports.CanvasTextAlign || (exports.CanvasTextAlign = {}));
var CanvasTextBaseLine;
(function (CanvasTextBaseLine) {
    CanvasTextBaseLine[CanvasTextBaseLine["Top"] = 0] = "Top";
    CanvasTextBaseLine[CanvasTextBaseLine["Middle"] = 1] = "Middle";
    CanvasTextBaseLine[CanvasTextBaseLine["Bottom"] = 2] = "Bottom";
})(CanvasTextBaseLine = exports.CanvasTextBaseLine || (exports.CanvasTextBaseLine = {}));
},{}],7:[function(require,module,exports){
"use strict";
/**
 *
 */
var CanvasWrapper_1 = require("./CanvasWrapper");
exports.CanvasWrapper = CanvasWrapper_1.CanvasWrapper;
var Enums_1 = require("./Enums");
exports.CanvasTextAlign = Enums_1.CanvasTextAlign;
exports.CanvasTextBaseLine = Enums_1.CanvasTextBaseLine;
},{"./CanvasWrapper":5,"./Enums":6}],8:[function(require,module,exports){
"use strict";
var Chart = (function () {
    function Chart(dataSource, renderType) {
        this.dataSource = dataSource;
        this.renderType = renderType;
    }
    return Chart;
}());
exports.Chart = Chart;
},{}],9:[function(require,module,exports){
"use strict";
/**
 * ChartArea class.
 */
var canvas_1 = require("../canvas");
var ChartArea = (function () {
    function ChartArea(mainCanvas, axisXCanvas, axisYCanvas) {
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
        var ctx = el.getContext('2d');
        if (ctx == null) {
            throw new Error('Context is null');
        }
        return new canvas_1.CanvasWrapper(ctx, w, h);
    };
    return ChartArea;
}());
exports.ChartArea = ChartArea;
},{"../canvas":7}],10:[function(require,module,exports){
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
},{"../axes":4,"../render":26,"./ChartArea":9,"./ChartStack":11,"./Enums":12,"jquery":1}],11:[function(require,module,exports){
"use strict";
/**
 * ChartStack class.
 */
var Chart_1 = require("./Chart");
var axes_1 = require("../axes");
var render_1 = require("../render");
var ChartStack = (function () {
    function ChartStack(area, timeAxis) {
        this.area = area;
        this.timeAxis = timeAxis;
        this.charts = [];
    }
    ChartStack.prototype.addChart = function (dataSource, renderType) {
        var newChart = new Chart_1.Chart(dataSource, renderType);
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
            var yAxis = new axes_1.NumberAxis(height, 1, { start: data.minOrdinateValue, end: data.maxOrdinateValue });
            if (chart.renderType === render_1.RenderType.Candlestick) {
                var candleRender = new render_1.CandlestickChartRenderer();
                candleRender.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else if (chart.renderType === render_1.RenderType.Line) {
                render_1.LineChartRenderer.render(this.area.mainContext, data, 0, 0, this.timeAxis, yAxis);
            }
            else {
                throw new Error("Unexpected RenderType " + chart.renderType);
            }
        }
        // render axis
        render_1.AxisRenderer.renderDateAxis(this.timeAxis, this.area.axisXContext);
    };
    return ChartStack;
}());
exports.ChartStack = ChartStack;
},{"../axes":4,"../render":26,"./Chart":8}],12:[function(require,module,exports){
"use strict";
/**
* Core enumerations.
*/
var TimeInterval;
(function (TimeInterval) {
    // TODO: Number can vary.
    TimeInterval[TimeInterval["month"] = 2592000000] = "month";
    TimeInterval[TimeInterval["week"] = 604800000] = "week";
    TimeInterval[TimeInterval["day"] = 86400000] = "day";
    TimeInterval[TimeInterval["hours4"] = 14400000] = "hours4";
    TimeInterval[TimeInterval["hour"] = 3600000] = "hour";
    TimeInterval[TimeInterval["min30"] = 1800000] = "min30";
    TimeInterval[TimeInterval["min15"] = 900000] = "min15";
    TimeInterval[TimeInterval["min5"] = 300000] = "min5";
    TimeInterval[TimeInterval["min"] = 60000] = "min";
})(TimeInterval = exports.TimeInterval || (exports.TimeInterval = {}));
var Unit;
(function (Unit) {
    Unit[Unit["Price"] = 0] = "Price";
})(Unit = exports.Unit || (exports.Unit = {}));
},{}],13:[function(require,module,exports){
/**
 *
 */
"use strict";
var Chart_1 = require("./Chart");
exports.Chart = Chart_1.Chart;
var ChartArea_1 = require("./ChartArea");
exports.ChartArea = ChartArea_1.ChartArea;
var ChartBoard_1 = require("./ChartBoard");
exports.ChartBoard = ChartBoard_1.ChartBoard;
var ChartStack_1 = require("./ChartStack");
exports.ChartStack = ChartStack_1.ChartStack;
var Enums_1 = require("./Enums");
exports.TimeInterval = Enums_1.TimeInterval;
exports.Unit = Enums_1.Unit;
},{"./Chart":8,"./ChartArea":9,"./ChartBoard":10,"./ChartStack":11,"./Enums":12}],14:[function(require,module,exports){
/**
* CandleArrayDataSource class.
*/
"use strict";
var shared_1 = require("../shared");
var CandleArrayDataSource = (function () {
    function CandleArrayDataSource(data) {
        this.data = data;
        this.dateChangedEvent = new shared_1.Event();
    }
    Object.defineProperty(CandleArrayDataSource.prototype, "dateChanged", {
        get: function () {
            return this.dateChangedEvent;
        },
        enumerable: true,
        configurable: true
    });
    CandleArrayDataSource.prototype.getData = function (range) {
        var lowestPrice = Number.MAX_VALUE;
        var highestPrice = Number.MIN_VALUE;
        // Filter data by date and find min/max price
        //
        var filteredData = this.data
            .filter(function (candle) {
            if (candle.date >= range.start && candle.date <= range.end) {
                // update min / max values
                if (candle.l < lowestPrice) {
                    lowestPrice = candle.l;
                }
                if (candle.h > highestPrice) {
                    highestPrice = candle.h;
                }
                return true;
            }
            return false;
        });
        console.debug("Data Source: min: " + lowestPrice + " max: " + highestPrice + " data.count: " + filteredData.length);
        return {
            data: filteredData,
            maxOrdinateValue: highestPrice,
            minOrdinateValue: lowestPrice
        };
    };
    return CandleArrayDataSource;
}());
exports.CandleArrayDataSource = CandleArrayDataSource;
},{"../shared":28}],15:[function(require,module,exports){
"use strict";
/**
 *
 */
var CandleArrayDataSource_1 = require("./CandleArrayDataSource");
exports.CandleArrayDataSource = CandleArrayDataSource_1.CandleArrayDataSource;
},{"./CandleArrayDataSource":14}],16:[function(require,module,exports){
/**
 * SimpleIndicator class.
 */
"use strict";
var shared_1 = require("../shared");
var SimpleIndicator = (function () {
    function SimpleIndicator(dataSource) {
        this.dataSource = dataSource;
        this.dateChangedEvent = new shared_1.Event();
        dataSource.dateChanged.on(this.onDataSourceChanged);
    }
    Object.defineProperty(SimpleIndicator.prototype, "dateChanged", {
        get: function () {
            return this.dateChangedEvent;
        },
        enumerable: true,
        configurable: true
    });
    SimpleIndicator.prototype.getData = function (range) {
        var indicator = [];
        var sourceData = this.dataSource.getData(range);
        for (var i = 3; i < sourceData.data.length; i++) {
            var value = (sourceData.data[i - 3].c
                + sourceData.data[i - 2].c
                + sourceData.data[i - 1].c) / 3;
            indicator.push({ date: sourceData.data[i].date, value: value });
        }
        return {
            data: indicator,
            minOrdinateValue: sourceData.minOrdinateValue,
            maxOrdinateValue: sourceData.maxOrdinateValue
        };
    };
    SimpleIndicator.prototype.onDataSourceChanged = function (arg) {
        this.dateChangedEvent.trigger();
    };
    return SimpleIndicator;
}());
exports.SimpleIndicator = SimpleIndicator;
},{"../shared":28}],17:[function(require,module,exports){
"use strict";
/**
 *
 */
var SimpleIndicator_1 = require("./SimpleIndicator");
exports.SimpleIndicator = SimpleIndicator_1.SimpleIndicator;
},{"./SimpleIndicator":16}],18:[function(require,module,exports){
"use strict";
},{}],19:[function(require,module,exports){
/**
 * Candlestick class.
 */
"use strict";
var Candlestick = (function () {
    function Candlestick() {
    }
    return Candlestick;
}());
exports.Candlestick = Candlestick;
},{}],20:[function(require,module,exports){
/**
 * Point class.
 */
"use strict";
var Point = (function () {
    function Point() {
    }
    return Point;
}());
exports.Point = Point;
},{}],21:[function(require,module,exports){
"use strict";
/**
 *
 */
var Candlestick_1 = require("./Candlestick");
exports.Candlestick = Candlestick_1.Candlestick;
var Point_1 = require("./Point");
exports.Point = Point_1.Point;
},{"./Candlestick":19,"./Point":20}],22:[function(require,module,exports){
/**
 * AxisRenderer
 *
 * @classdesc Contains methods for rendering axes.
 */
"use strict";
var AxisRenderer = (function () {
    function AxisRenderer() {
    }
    AxisRenderer.renderDateAxis = function (dateAxis, canvas) {
        var scaleFit = new ScaleFit(dateAxis.width, dateAxis.interval, dateAxis.range);
        var bars = scaleFit.getBars();
        canvas.setStrokeStyle('black');
        canvas.beginPath();
        for (var _i = 0, bars_1 = bars; _i < bars_1.length; _i++) {
            var bar = bars_1[_i];
            var x = dateAxis.toX(bar);
            this.drawBar(canvas, bar, x);
        }
        canvas.stroke();
        canvas.closePath();
    };
    AxisRenderer.drawBar = function (canvas, date, x) {
        // draw bar
        canvas.moveTo(x, 7);
        canvas.lineTo(x, 10);
        // draw time mark
        // TODO: Use toString("yyyy-mm...")
        var markText = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " + date.getHours() + ":" + date.getMinutes();
        var w = canvas.measureText(markText).width;
        canvas.strokeText(markText, x - w / 2, 25);
        console.debug("bar line: {" + x + "," + 7 + "} - {" + x + "," + 10 + "}");
    };
    return AxisRenderer;
}());
exports.AxisRenderer = AxisRenderer;
// Calculates how many bars should be placed on the chart and where it should be placed.
var ScaleFit = (function () {
    function ScaleFit(width, interval, range) {
        this.scales = [
            60000,
            300000,
            600000,
            900000,
            1800000,
            3600000,
            14000000,
            21600000,
            43200000,
            86400000,
            259200000,
            604800000,
            864000000,
            2678400000,
        ];
        this.selectedScale = 0;
        this.interval = interval;
        this.range = range;
        // Calculate min and max count of bars that can be placed on the chart
        _a = this.getMinMaxBars(width), this.minBars = _a[0], this.maxBars = _a[1];
        // Choose fitting scale
        var dateRange = Math.abs(range.end.getTime() - range.start.getTime());
        this.selectedScale = 0;
        for (var _i = 0, _b = this.scales; _i < _b.length; _i++) {
            var scale = _b[_i];
            if (scale < interval) {
                continue;
            }
            // how many bars require this scale:
            var barsRequired = Math.ceil(dateRange / scale + 1);
            if (barsRequired >= this.minBars && barsRequired <= this.maxBars) {
                this.selectedScale = scale;
                break;
            }
        }
        var _a;
    }
    ScaleFit.prototype.getBars = function () {
        if (this.selectedScale == 0) {
            return [];
        }
        var bars = [];
        // Calculate first bar
        var bar;
        // ... if start time is placed on bar use it, otherwise calculate where first bar lays
        if (this.range.start.getTime() % this.selectedScale == 0) {
            bar = this.range.start;
        }
        else {
            // ... add scale value and truncate 
            var time = this.range.start.getTime() + this.selectedScale;
            bar = new Date(time - (time % this.selectedScale));
        }
        // Calculate remaining bars
        var t = bar.getTime();
        var end = this.range.end.getTime();
        while (t <= end) {
            bars.push(new Date(t));
            t += this.selectedScale;
        }
        return bars;
    };
    ScaleFit.prototype.getMinMaxBars = function (w) {
        // TODO: what if width does not allow any bars
        return [
            3,
            Math.max(w / 50) // maximum bars
        ];
    };
    return ScaleFit;
}());
},{}],23:[function(require,module,exports){
/**
* CandlestickChartRenderer
*
* @classdesc Renders specified data in a form of candlestick chart.
*/
"use strict";
var CandlestickChartRenderer = (function () {
    function CandlestickChartRenderer() {
    }
    CandlestickChartRenderer.prototype.render = function (canvas, data, offsetX, offsetY, timeAxis, yAxis) {
        console.debug("[CandlestickChartRenderer] start rendering...");
        // Calculate size of frame
        var frameSize = {
            width: canvas.w,
            height: canvas.h
        };
        // Render
        //
        this.startRender(canvas);
        for (var _i = 0, _a = data.data; _i < _a.length; _i++) {
            var candle = _a[_i];
            this.renderCandle(canvas, timeAxis, yAxis, candle, frameSize);
        }
        this.finishRender(canvas);
    };
    CandlestickChartRenderer.prototype.startRender = function (canvas) {
    };
    CandlestickChartRenderer.prototype.finishRender = function (canvas) {
    };
    CandlestickChartRenderer.prototype.renderCandle = function (canvas, timeAxis, yAxis, candle, frameSize) {
        // Lower and upper ranges of the candle's body.
        //let bodyMin = Math.min(candle.o, candle.c);
        //let bodyMax = Math.max(candle.o, candle.c);
        // Startin drawing
        canvas.setStrokeStyle('#333333');
        canvas.beginPath();
        var x = timeAxis.toX(candle.date);
        var ocMin = yAxis.toX(Math.min(candle.o, candle.c)), ocMax = yAxis.toX(Math.max(candle.o, candle.c)), h = yAxis.toX(candle.h), l = yAxis.toX(candle.l);
        // Drawing upper shadow
        this.line(canvas, x, ocMax, x, h);
        // Drawing lower shadow
        this.line(canvas, x, l, x, ocMin);
        canvas.stroke();
        canvas.closePath();
        // Drawing body
        if (candle.c > candle.o) {
            canvas.setFillStyle('#008910');
        }
        else {
            canvas.setFillStyle('#D80300');
        }
        this.rect(canvas, x - 1, ocMin, x + 1, ocMax);
    };
    CandlestickChartRenderer.prototype.line = function (canvas, x1, y1, x2, y2) {
        console.debug("line: {" + x1 + "," + y1 + "} - {" + x2 + "," + y2 + "}");
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    };
    CandlestickChartRenderer.prototype.rect = function (canvas, x1, y1, x2, y2) {
        console.debug("rect: {" + x1 + "," + y1 + "} - {" + x2 + "," + y2 + "}");
        canvas.fillRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
        canvas.strokeRect(x1, y1, Math.abs(x2 - x1), Math.abs(y2 - y1));
    };
    return CandlestickChartRenderer;
}());
exports.CandlestickChartRenderer = CandlestickChartRenderer;
},{}],24:[function(require,module,exports){
"use strict";
/**
 * Render related enums.
 */
var RenderType;
(function (RenderType) {
    RenderType[RenderType["Candlestick"] = 0] = "Candlestick";
    RenderType[RenderType["Line"] = 1] = "Line";
})(RenderType = exports.RenderType || (exports.RenderType = {}));
},{}],25:[function(require,module,exports){
/**
* LineChartRenderer
*
* @classdesc Renders specified data in a form of line chart.
*/
"use strict";
var LineChartRenderer = (function () {
    function LineChartRenderer() {
    }
    LineChartRenderer.render = function (canvas, data, offsetX, offsetY, timeAxis, yAxis) {
        console.debug("[LineChartRenderer] start rendering...");
        // Calculate size of frame
        var frameSize = {
            width: canvas.w,
            height: canvas.h
        };
        // Calculate size of candles
        // Render
        for (var i = 1; i < data.data.length; i++) {
            this.renderPart(canvas, timeAxis, yAxis, data.data[i - 1], data.data[i], frameSize);
        }
    };
    LineChartRenderer.renderPart = function (canvas, timeAxis, yAxis, pointFrom, pointTo, frameSize) {
        // Startin drawing
        canvas.setStrokeStyle('#555555');
        canvas.beginPath();
        var x1 = timeAxis.toX(pointFrom.date), y1 = yAxis.toX(pointFrom.value);
        var x2 = timeAxis.toX(pointTo.date), y2 = yAxis.toX(pointTo.value);
        // Drawing upper shadow
        this.line(canvas, x1, y1, x2, y2);
        canvas.stroke();
        canvas.closePath();
    };
    LineChartRenderer.line = function (canvas, x1, y1, x2, y2) {
        console.debug("line: {" + x1 + "," + y1 + "} - {" + x2 + "," + y2 + "}");
        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
    };
    return LineChartRenderer;
}());
exports.LineChartRenderer = LineChartRenderer;
},{}],26:[function(require,module,exports){
"use strict";
/**
 *
 */
var AxisRenderer_1 = require("./AxisRenderer");
exports.AxisRenderer = AxisRenderer_1.AxisRenderer;
var CandlestickChartRenderer_1 = require("./CandlestickChartRenderer");
exports.CandlestickChartRenderer = CandlestickChartRenderer_1.CandlestickChartRenderer;
var Enums_1 = require("./Enums");
exports.RenderType = Enums_1.RenderType;
var LineChartRenderer_1 = require("./LineChartRenderer");
exports.LineChartRenderer = LineChartRenderer_1.LineChartRenderer;
},{"./AxisRenderer":22,"./CandlestickChartRenderer":23,"./Enums":24,"./LineChartRenderer":25}],27:[function(require,module,exports){
/**
* Typed events for TypeScript.
*/
"use strict";
var Event = (function () {
    function Event() {
        this.handlers = [];
    }
    Event.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    Event.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    Event.prototype.trigger = function (data) {
        this.handlers
            .slice(0)
            .forEach(function (h) { return h(data); });
    };
    return Event;
}());
exports.Event = Event;
},{}],28:[function(require,module,exports){
"use strict";
/**
 *
 */
var Event_1 = require("./Event");
exports.Event = Event_1.Event;
},{"./Event":27}],29:[function(require,module,exports){
/**
 *
 */
"use strict";
var core_1 = require("./lib/core");
var axes = require("./lib/axes");
var canvas = require("./lib/canvas");
var data = require("./lib/data");
var indicator = require("./lib/indicator");
var interaction = require("./lib/interaction");
var model = require("./lib/model");
var render = require("./lib/render");
var shared = require("./lib/shared");
// export {
//     ChartBoard
// }
window.lychart = {
    Chart: core_1.Chart,
    ChartArea: core_1.ChartArea,
    ChartBoard: core_1.ChartBoard,
    ChartStack: core_1.ChartStack,
    TimeInterval: core_1.TimeInterval,
    Unit: core_1.Unit,
    // 
    axes: axes,
    canvas: canvas,
    data: data,
    indicator: indicator,
    interaction: interaction,
    model: model,
    render: render,
    shared: shared
};
},{"./lib/axes":4,"./lib/canvas":7,"./lib/core":13,"./lib/data":15,"./lib/indicator":17,"./lib/interaction":18,"./lib/model":21,"./lib/render":26,"./lib/shared":28}]},{},[29])(29)
});


//# sourceMappingURL=bundle.js.map
