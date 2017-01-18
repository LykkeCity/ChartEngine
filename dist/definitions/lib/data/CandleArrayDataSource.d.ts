/**
 * CandleArrayDataSource class.
 */
import { Candlestick } from '../model';
import { IEvent, IRange } from '../shared';
import { IChartData, IDataSource } from './Interfaces';
export declare class CandleArrayDataSource implements IDataSource<Candlestick> {
    private data;
    private dateChangedEvent;
    constructor(data: Candlestick[]);
    readonly dateChanged: IEvent<void>;
    getData(range: IRange<Date>): IChartData<Candlestick>;
}
