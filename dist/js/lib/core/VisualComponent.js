"use strict";
var shared_1 = require("../shared");
// export class VisualComponentDesc {
//     public offset: Point;
//     constructor(offset: Point) {
//         this.offset = offset;
//     }
// }
var VisualComponent = (function () {
    // protected childrenDesc: VisualComponentDesc[] = [];
    function VisualComponent(offset, size) {
        this.children = [];
        this.offset = offset ? offset : new shared_1.Point(0, 0);
        this.size = size ? size : { width: 0, height: 0 };
    }
    VisualComponent.prototype.addChild = function (child) {
        this.children.push(child);
        //this.childrenDesc.push(new VisualComponentDesc(offset));
    };
    return VisualComponent;
}());
exports.VisualComponent = VisualComponent;
