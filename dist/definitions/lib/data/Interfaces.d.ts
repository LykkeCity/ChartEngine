/**
 * Data interfaces.
 */
import { TimeInterval } from '../core';
import { IEvent, IRange } from '../shared';
export interface IChartData<T> {
    readonly data: T[];
}
export interface IDataSource<T> {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IChartData<T>;
    dateChanged: IEvent<void>;
}
