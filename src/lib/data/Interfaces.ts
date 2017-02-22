/**
 * Data interfaces.
 */
import { TimeInterval } from '../core/index';
import { IEvent, IRange } from '../shared/index';
import { DataChangedArgument } from './DataChangedEvent';

export interface IDataSource<T> {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T>;
    dateChanged: IEvent<DataChangedArgument>;
    dataType: { new(d: Date): T };
}

export interface IDataIterator<T> {
    reset(): void;
    moveNext(): boolean;
    current: T;
}

export interface IDataResolverDelegate<T> {
    (response: any): IResponse<T>;
}

export interface IDataReaderDelegate<T> {
    (timeStart: Date, timeEnd: Date, interval: string): JQueryPromise<IResponse<T>>;
}

export interface IDataSnapshot<T> {
    timestamp: number;
    data: T[];
}

export interface IDataStorage<T> {
    first: T | undefined;
    last: T | undefined;
    isEmpty: boolean;
    getIterator(filter?: (item: T) => boolean): IDataIterator<T>;
    merge(update: T[]): void;
}

export interface IPendingRequest<T> {
    uid: number;
    request: JQueryPromise<IResponse<T>>;
    interval: TimeInterval;
    range: IRange<Date>;
}

export interface IResponse<T> {
    data: T[];
    interval: string;
    startDateTime: Date;
    endDateTime: Date;
}
