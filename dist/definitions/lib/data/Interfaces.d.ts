/// <reference types="jquery" />
/**
 * Data interfaces.
 */
import { TimeInterval } from '../core/index';
import { IEvent, IRange } from '../shared/index';
export interface IDataSource<T> {
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T>;
    dateChanged: IEvent<DataChangedArgument>;
    dataType: {
        new (d: Date): T;
    };
}
export interface IDataIterator<T> {
    reset(): void;
    moveNext(): boolean;
    current: T;
}
export interface IDataSnapshot<T> {
    timestamp: number;
    data: T[];
}
export declare class DataChangedArgument {
    private _range;
    private _interval;
    constructor(range: IRange<Date>, interval: TimeInterval);
    readonly range: IRange<Date>;
    readonly interval: TimeInterval;
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
