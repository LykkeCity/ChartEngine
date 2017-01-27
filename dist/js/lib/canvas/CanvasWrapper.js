/**
 * CanvasWrapper class.
 *
 * @classdesc Incapsulates usage of canvas.
 */
"use strict";
var Enums_1 = require("./Enums");
var CanvasWrapper = (function () {
    function CanvasWrapper(context, width, height) {
        this.adj = 0.5; // Adjusment to remove blury lines.
        this.ctx = context;
        this.w = width;
        this.h = height;
        //this.dpr = window.devicePixelRatio || 1;
        this.dpr = 1;
    }
    Object.defineProperty(CanvasWrapper.prototype, "font", {
        get: function () {
            return this.ctx.font;
        },
        set: function (font) {
            this.ctx.font = font;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CanvasWrapper.prototype, "lineWidth", {
        get: function () {
            return this.ctx.lineWidth;
        },
        set: function (w) {
            this.adj = (w % 2) / 2; // If line is width 1, 3, 5... then adjust coords to remove blur.
            this.ctx.lineWidth = w;
        },
        enumerable: true,
        configurable: true
    });
    CanvasWrapper.prototype.clear = function () {
        this.ctx.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
    };
    CanvasWrapper.prototype.moveTo = function (x, y) {
        this.ctx.moveTo(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj);
    };
    CanvasWrapper.prototype.lineTo = function (x, y) {
        this.ctx.lineTo(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj);
    };
    CanvasWrapper.prototype.getLineDash = function () {
        return this.ctx.getLineDash();
    };
    CanvasWrapper.prototype.setLineDash = function (segments) {
        this.ctx.setLineDash(segments);
    };
    CanvasWrapper.prototype.fillText = function (s, x, y) {
        this.ctx.fillText(s, Math.round(x * this.dpr), Math.round(y * this.dpr));
    };
    CanvasWrapper.prototype.fillRect = function (x, y, w, h) {
        this.ctx.fillRect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj, Math.round(w * this.dpr), Math.round(h * this.dpr));
    };
    CanvasWrapper.prototype.strokeRect = function (x, y, w, h) {
        this.ctx.strokeRect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj, Math.round(w * this.dpr), Math.round(h * this.dpr));
    };
    // Used with beginPath() / stroke() / strokeStyle / fill()
    CanvasWrapper.prototype.rect = function (x, y, w, h) {
        this.ctx.rect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj, Math.round(w * this.dpr), Math.round(h * this.dpr));
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
        this.ctx.strokeText(text, Math.round(x), Math.round(y), maxWidth);
    };
    CanvasWrapper.prototype.round = function (n) {
        // With a bitwise or.
        return (0.5 + n) | 0;
        // // A double bitwise not.
        // rounded = ~~ (0.5 + n);
        // // Finally, a left bitwise shift.
        // rounded = (0.5 + n) << 0;
    };
    return CanvasWrapper;
}());
exports.CanvasWrapper = CanvasWrapper;
