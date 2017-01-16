define(["require", "exports", "core/Enums"], function (require, exports, Enums_1) {
    "use strict";
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
});
