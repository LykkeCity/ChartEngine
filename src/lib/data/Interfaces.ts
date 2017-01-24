/**
 * Data interfaces.
 */
import { TimeInterval } from '../core/index';
import { IEvent, IRange } from '../shared/index';

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

export interface IDataSnapshot<T> {
    timestamp: number;
    data: T[];
}

export class DataChangedArgument {
    private _range: IRange<Date>;
    private _interval: TimeInterval;

    constructor(range: IRange<Date>, interval: TimeInterval) {
        this._range = range;
        this._interval = interval;
    }

    public get range() {
        return this._range;
    }

    public get interval() {
        return this._interval;
    }
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
