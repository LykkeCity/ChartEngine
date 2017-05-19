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
register('horizon-line', drawing.DrawHorizontalLineState.instance);

const states = {
    register: register
};

// Registor built-in indicators
indicator.register('alligator', indicator.AlligatorIndicator);
indicator.register('bollinger', indicator.BollingerIndicator);
indicator.register('stochastic-osc', indicator.StochasticOscillator);
indicator.register('DEMA', indicator.DEMAIndicator);
indicator.register('EMA', indicator.EMAIndicator);
indicator.register('SMA', indicator.SMAIndicator);
indicator.register('SMMA', indicator.SMMAIndicator);
indicator.register('TEMA', indicator.TEMAIndicator);
indicator.register('TMA', indicator.TMAIndicator);
indicator.register('WMA', indicator.WMAIndicator);
indicator.register('ADX', indicator.ADXIndicator);

// Register built-in renderers
render.RenderLocator.Instance.register('alligator', indicator.AlligatorIndicatorRenderer);
render.RenderLocator.Instance.register('bollinger', indicator.BollingerIndicatorRenderer);
render.RenderLocator.Instance.register('stochastic-osc', indicator.StochasticOscillatorRenderer);
render.RenderLocator.Instance.register('DEMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('EMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('SMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('SMMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('TEMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('TMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('WMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('ADX', render.LinestickChartRenderer);

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
