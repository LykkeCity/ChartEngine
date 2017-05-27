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
indicator.register('SSTOC', indicator.SlowStochasticOscillator);
indicator.register('FSTOC', indicator.FastStochasticOscillator);
indicator.register('CCI', indicator.CCIOscillator);
indicator.register('DEMA', indicator.DEMAIndicator);
indicator.register('DMI', indicator.DMIIndicator);
indicator.register('EMA', indicator.EMAIndicator);
indicator.register('MOM', indicator.MOMIndicator);
indicator.register('SMA', indicator.SMAIndicator);
indicator.register('SMMA', indicator.SMMAIndicator);
indicator.register('TEMA', indicator.TEMAIndicator);
indicator.register('TMA', indicator.TMAIndicator);
indicator.register('WMA', indicator.WMAIndicator);
indicator.register('ADX', indicator.ADXIndicator);
indicator.register('ATR', indicator.ATRIndicator);
indicator.register('ARO', indicator.AroonIndicator);
indicator.register('AOS', indicator.AroonOscillator);
indicator.register('HHLL', indicator.HHLLIndicator);
indicator.register('IKH', indicator.IKHIndicator);
indicator.register('RB', indicator.RBIndicator);
indicator.register('STDEV', indicator.STDEVIndicator);
indicator.register('TP', indicator.TPIndicator);
indicator.register('RSI', indicator.RSIOscillator);
indicator.register('RSL', indicator.RSLOscillator);
indicator.register('ROC', indicator.ROCIndicator);
indicator.register('OBOS', indicator.OBOSOscillator);
indicator.register('DIX', indicator.DIXOscillator);
indicator.register('DSSBR', indicator.DSSBROscillator);
indicator.register('PCR', indicator.PCROscillator);
indicator.register('MD', indicator.MDIndicator);
indicator.register('MACD', indicator.MACDIndicator);
indicator.register('ST', indicator.STIndicator);

// Register built-in renderers
render.RenderLocator.Instance.register('alligator', indicator.AlligatorIndicatorRenderer);
render.RenderLocator.Instance.register('bollinger', indicator.BollingerIndicatorRenderer);
render.RenderLocator.Instance.register('SSTOC', indicator.StochasticOscillatorRenderer);
render.RenderLocator.Instance.register('FSTOC', indicator.StochasticOscillatorRenderer);
render.RenderLocator.Instance.register('CCI', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('DEMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('DMI', indicator.DMIIndicatorRenderer);
render.RenderLocator.Instance.register('EMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('SMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('SMMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('TEMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('TMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('WMA', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('ADX', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('ATR', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('ARO', indicator.AroonIndicatorRenderer);
render.RenderLocator.Instance.register('AOS', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('HHLL', indicator.HHLLIndicatorRenderer);
render.RenderLocator.Instance.register('IKH', indicator.IKHIndicatorRenderer);
render.RenderLocator.Instance.register('RB', indicator.RBIndicatorRenderer);
render.RenderLocator.Instance.register('STDEV', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('TP', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('RSI', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('RSL', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('MOM', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('ROC', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('OBOS', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('DIX', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('DSSBR', indicator.DSSBROscillatorRenderer);
render.RenderLocator.Instance.register('PCR', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('MD', render.LinestickChartRenderer);
render.RenderLocator.Instance.register('MACD', indicator.MACDIndicatorRenderer);
render.RenderLocator.Instance.register('ST', indicator.STIndicatorRenderer);

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
