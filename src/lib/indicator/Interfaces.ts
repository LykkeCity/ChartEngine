/**
 * 
 */
import { ICanvas } from '../canvas/index';
import { IAxis, TimeInterval } from '../core/index';
import { DataChangedArgument, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';

export interface IContext {
    interval(): TimeInterval;
    addInterval: (date: Date, times: number) => Date;
    getCandle: (asset: string, baseDate: Date, interval: TimeInterval) => Promise<Candlestick>;
    render: () => void;
}

export interface IIndicator {
    compute(iterator: IDataIterator<Candlestick>, storage: IDataStorage<Candlestick>): Candlestick[];
}

// export interface IRenderer {
//     render(canvas: ICanvas, data: Candlestick[], frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
// }
