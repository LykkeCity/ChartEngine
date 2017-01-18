/**
 * Data interfaces.
 */
import { IEvent, IRange } from '../shared';

export interface IChartData<T> {
    readonly data: T[];
    // readonly maxOrdinateValue: number;
    // readonly minOrdinateValue: number;
}

export interface IDataSource<T> {
    getValuesRange(range: IRange<Date>): IRange<number>;
    getData(range: IRange<Date>): IChartData<T>;
    dateChanged: IEvent<void>;
}
