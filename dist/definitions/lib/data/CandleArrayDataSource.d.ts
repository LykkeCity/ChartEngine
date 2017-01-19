/**
 * CandleArrayDataSource class.
 */
import { TimeInterval } from '../core';
import { Candlestick } from '../model';
import { IEvent, IRange } from '../shared';
import { IChartData, IDataSource } from './Interfaces';
export declare class CandleArrayDataSource implements IDataSource<Candlestick> {
    private data;
    private dateChangedEvent;
    private defaultMinValue;
    private defaultMaxValue;
    constructor(data: Candlestick[]);
    readonly dateChanged: IEvent<void>;
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IChartData<Candlestick>;
}
