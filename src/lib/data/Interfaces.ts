/**
 * Data interfaces.
 */
import { TimeInterval } from '../core/index';
import { IEvent, IRange } from '../shared/index';
import { DataChangedArgument } from './DataChangedEvent';

export interface IDataSourceUntyped {
    dateChanged: IEvent<DataChangedArgument>;
}

export interface IDataSource<T> extends IDataSourceUntyped {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T>;
    dataType: { new(d: Date): T };
}

export interface IDataIterator<T> {
    reset(): void;
    moveNext(): boolean;
    current: T;
}

export interface IDataReaderDelegate<T> {
    (timeStart: Date, timeEnd: Date, timeInterval: TimeInterval): JQueryPromise<IResponse<T>>;
}

export interface IDataResolverDelegate<T, U> {
    (response: IResponse<T>): IResponse<U>;
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
    interval: TimeInterval; //keyof typeof TimeInterval;
    startDateTime: Date;
    endDateTime: Date;
}
