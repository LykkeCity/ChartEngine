/**
 *
 */
"use strict";
var component_1 = require("./lib/component");
var axes = require("./lib/axes");
var canvas = require("./lib/canvas");
var core = require("./lib/core");
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
    Chart: component_1.Chart,
    ChartArea: component_1.ChartArea,
    ChartBoard: component_1.ChartBoard,
    ChartStack: component_1.ChartStack,
    TimeInterval: component_1.TimeInterval,
    Unit: component_1.Unit,
    // 
    axes: axes,
    canvas: canvas,
    core: core,
    data: data,
    indicator: indicator,
    interaction: interaction,
    model: model,
    render: render,
    shared: shared
};
