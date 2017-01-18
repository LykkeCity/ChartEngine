/**
 * Data interfaces.
 */
import { IEvent, IRange } from '../shared';

export interface IChartData<T> {
    readonly data: T[];
    readonly maxOrdinateValue: number;
    readonly minOrdinateValue: number;
}

export interface IDataSource<T> {
    getData(range: IRange<Date>): IChartData<T>;
    dateChanged: IEvent<void>;
}
