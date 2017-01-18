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
