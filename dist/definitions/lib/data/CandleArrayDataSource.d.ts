/**
 * CandleArrayDataSource class.
 */
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
    getValuesRange(range: IRange<Date>): IRange<number>;
    getData(range: IRange<Date>): IChartData<Candlestick>;
}
