"use strict";
var index_1 = require("../shared/index");
var VisualComponent = (function () {
    function VisualComponent(offset, size) {
        this.children = [];
        this._offset = offset ? offset : new index_1.Point(0, 0);
        this._size = size ? size : { width: 0, height: 0 };
    }
    Object.defineProperty(VisualComponent.prototype, "offset", {
        // protected childrenDesc: VisualComponentDesc[] = [];
        get: function () {
            return this._offset;
        },
        set: function (value) {
            this._offset = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VisualComponent.prototype, "size", {
        get: function () {
            return this._size;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(VisualComponent.prototype, "target", {
        get: function () {
            // TODO: Make an enum
            return 'base'; // 'front'
        },
        enumerable: true,
        configurable: true
    });
    VisualComponent.prototype.addChild = function (child) {
        this.children.push(child);
    };
    VisualComponent.prototype.render = function (context, renderLocator) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            // convert mouse coords to relative coords
            var origMousePos = context.mousePosition;
            if (context.mousePosition) {
                context.mousePosition = new index_1.Point(context.mousePosition.x - child.offset.x, context.mousePosition.y - child.offset.y);
            }
            child.render(context, renderLocator);
            // restore mousePosition
            context.mousePosition = origMousePos;
        }
    };
    VisualComponent.prototype.forEach = function (delegate) {
        for (var _i = 0, _a = this.children; _i < _a.length; _i++) {
            var child = _a[_i];
            delegate(child);
            child.forEach(delegate);
        }
    };
    return VisualComponent;
}());
exports.VisualComponent = VisualComponent;
