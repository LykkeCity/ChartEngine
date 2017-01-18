/**
 * 
 */

import {
    Chart,
    ChartArea,
    ChartBoard,
    ChartStack,
    TimeInterval,
    Unit
} from './lib/core';

import * as axes from './lib/axes';
import * as canvas from './lib/canvas';
import * as data from './lib/data';
import * as indicator from './lib/indicator';
import * as interaction from './lib/interaction';
import * as model from './lib/model';
import * as render from './lib/render';
import * as shared from './lib/shared';

// export {
//     ChartBoard
// }

(<any>window).lychart = {
    Chart: Chart,
    ChartArea: ChartArea,
    ChartBoard: ChartBoard,
    ChartStack: ChartStack,
    TimeInterval: TimeInterval,
    Unit: Unit,
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
