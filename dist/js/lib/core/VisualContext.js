"use strict";
var VisualContext = (function () {
    function VisualContext(renderBase, renderFront, baseCanvas, frontCanvas, mousePosition) {
        this._renderBase = renderBase;
        this._renderFront = renderFront;
        this.baseCanvas = baseCanvas;
        this.frontCanvas = frontCanvas;
        this.mousePosition = mousePosition;
    }
    Object.defineProperty(VisualContext.prototype, "renderBase", {
        get: function () {
            return this._renderBase;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VisualContext.prototype, "renderFront", {
        get: function () {
            return this._renderFront;
        },
        enumerable: true,
        configurable: true
    });
    VisualContext.prototype.getCanvas = function (canvasId) {
        switch (canvasId) {
            case 'base': return this.baseCanvas;
            case 'front': return this.frontCanvas;
            default: throw new Error('Unexpected canvasId ' + canvasId);
        }
    };
    return VisualContext;
}());
exports.VisualContext = VisualContext;
