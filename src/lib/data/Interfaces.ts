/**
 * Data interfaces.
 */
import { IConfigurable, IIndicatorExtension, TimeInterval } from '../core/index';
import { Candlestick, Uid } from '../model/index';
import { IDisposable, IEvent, IRange } from '../shared/index';
import { DataChangedArgument } from './DataChangedEvent';
import { IDataSourceRegister } from './DataSourceRegister';

export interface IContext {
    interval(): TimeInterval;
    addInterval: (date: Date, times: number) => Date;
    getCandle: (asset: string, baseDate: Date, interval: TimeInterval) => Promise<Candlestick>;
    render: () => void;
    register: IDataSourceRegister;
}

export interface IDataSource<T> extends IDisposable, IConfigurable {
    dataType: { new(d: Date): T };
    dataChanged: IEvent<DataChangedArgument>;
    asset: string;
    name: string;

    /**
     * Creates new iterator
     */
    getIterator(): IDataIterator<T>;
    /**
     * Loads data asynchronously. uid is included in count.
     */
    load(uid: Uid, count: number): void;
    /**
     * Loads specified range asynchronously.
     * Can load in chunks until the whole range is loaded.
     * Both uid are inclusive.
     */
    loadRange(uidFirst: Uid, uidLast: Uid): void;
    /**
     * States that items till the specified uid stay in memory.
     */
    lock(uid: Uid): void;

    /**
     * Returns min and max values in the specified range
     */
    getValuesRange(range: IRange<Uid>): IRange<number>;

    addExtension(name: string, ext: IIndicatorExtension): void;
    removeExtension(name: string): void;

    setTimeRange(range: IRange<Date>): void;
}

export interface IDataIterator<T> {
    current: T;
    previous: T|undefined;
    last: T|undefined;

    /**
     * Starts search from the beginning of data.
     */
    goTo(predicate: (item: T) => boolean): boolean;

    goToLast(): boolean;

    goWhile(predicate: (item: T) => boolean): boolean;

    /**
     * Moves pointer forward untill condition is met.
     * Returns count of moves done. Or -1 if could not find element.
     */
    moveTo(predicate: (item: T) => boolean): number;
    //moveTo(uid: Uid): number;

    //reset(): void;
    /**
     * Moves pointer on 1 item forward.
     * Returns false if can not move.
     */
    moveNext(): boolean;
    /**
     * Moves pointer on 1 item backwards.
     * Returns false if can not move.
     */
    movePrev(): boolean;

    // /**
    //  * Moves pointer forward n times.
    //  * Returns actual count of moves done.
    //  */
    // moveNextTimes(n: number): number;

    /**
     * Moves pointer forward/backward n times.
     * Returns actual count of moves done (positive).
     */
    moveTimes(n: number): number;

    /**
     * Iterates backwards starting from the current position.
     * Iterats till @func returns "true" and begginning of storage is not reached.
     * @param func 
     */
    somebackward(func: (item: T, counter: number) => boolean): void;

    //find(predicate: (item: T) => boolean): T | undefined;

    /**
     * Positive or 0.
     */
    //count(): number;    
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
    /**
     * Creates new iterator
     */
    getIterator(filter?: (item: T) => boolean): IDataIterator<T>;

    first: T | undefined;
    last: T | undefined;
    isEmpty: boolean;
    clear() : void;
    // contains(predicate: (item: T) => boolean): boolean;
    // containsCount(predicate: (item: T) => boolean, count: number): boolean;
    // filter(filter?: (item: T) => boolean): IDataIterator<T>;
    // findLast(predicate: (item: T) => boolean): T | undefined;
    //getIterator(predicate: (item: T) => boolean, count: number): IDataIterator<T>;
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
