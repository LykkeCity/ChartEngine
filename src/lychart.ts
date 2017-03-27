/**
 * Main module.
 */
import {
    Chart,
    ChartBoard,
    FigureComponent,
    HoverState,
    IStateController,
    MoveChartState,
    StateFabric
} from './lib/component';

import * as axes from './lib/axes';
import * as canvas from './lib/canvas';
import * as core from './lib/core';
import * as data from './lib/data';
import * as drawing from './lib/drawing';
import * as indicator from './lib/indicator';
import * as model from './lib/model';
import * as render from './lib/render';
import * as shared from './lib/shared';
import * as utils from './lib/utils';

function register(stateId: string, state: IStateController) {
    StateFabric.instance.setState(stateId, state);
}

// Register built-in states
register('hover', HoverState.instance);
register('movechart', MoveChartState.instance);

// Register built-in drawing tools
register('line', drawing.DrawLineState.instance);

const states = {
    register: register
};

const lychart = {
    // types:
    Chart: Chart,
    ChartBoard: ChartBoard,
    FigureComponent: FigureComponent,
    // namespaces:
    axes: axes,
    canvas: canvas,
    core: core,
    data: data,
    drawing: drawing,
    indicator: indicator,
    model: model,
    render: render,
    states: states,
    shared: shared,
    utils: utils
};

(<any>window).lychart = lychart;

export {
    // types:
    Chart,
    ChartBoard,
    FigureComponent,
    // namespaces:
    axes,
    canvas,
    core,
    data,
    drawing,
    indicator,
    model,
    render,
    states,
    shared,
    utils
};
