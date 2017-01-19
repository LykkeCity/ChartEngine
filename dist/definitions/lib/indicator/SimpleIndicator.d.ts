/**
 * SimpleIndicator class.
 */
import { TimeInterval } from '../core';
import { IChartData, IDataSource } from '../data';
import { Candlestick, Point } from '../model';
import { IEvent, IRange } from '../shared';
export declare class SimpleIndicator implements IDataSource<Point> {
    private dataSource;
    private dateChangedEvent;
    constructor(dataSource: IDataSource<Candlestick>);
    readonly dateChanged: IEvent<void>;
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IChartData<Point>;
    protected onDataSourceChanged(arg?: void): void;
}
