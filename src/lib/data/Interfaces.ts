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

export interface IIndicator {
    compute(iterator: IDataIterator<Candlestick>, storage: IDataStorage<Candlestick>): Candlestick[];
}

export interface IDataSource<T> extends IDisposable, IConfigurable {
    dataType: { new(d: Date): T };
    dataChanged: IEvent<DataChangedArgument>;
    asset: string;
    name: string;
    precision: number;

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

    getHHLL(uidFrom: Uid, uidTo: Uid): Candlestick|undefined;
    getLastCandle(): Candlestick|undefined;
}

export interface IBasicIterator<T> {
    current: T;

    /**
     * Moves pointer on 1 item forward.
     * Returns false if can not move.
     */
    moveNext(): boolean;
    reset(): void;
}

/**
 * Data Iterator interface.
 * 
 * go* methods reset iterator to the start.
 * move* methods continue from current position. 
 */
export interface IDataIterator<T> extends IBasicIterator<T> {
    //current: T;
    previous: T|undefined;
    first: T|undefined;
    last: T|undefined;

    getCount(): number;

    /**
     * Starts search from the beginning of data.
     * If item is found returns true, if not - false.
     */
    goTo(predicate: (item: T) => boolean): boolean;

    goToLast(): boolean;

    /**
     * Moves iterator while condition is met. Stays on the last element that satisfies condition.
     * Starts from the beginning.
     * @param predicate 
     */
    goWhile(predicate: (item: T) => boolean): boolean;

    /**
     * Moves pointer forward untill condition is met.
     * Returns count of moves done. Or -1 if could not find element.
     */
    moveTo(predicate: (item: T) => boolean): number;

    /**
     * Moves pointer on 1 item backwards.
     * Returns false if can not move.
     */
    movePrev(): boolean;

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
    movePrevWhile(func: (item: T, counter: number) => boolean): void;
}

export interface IDataReaderDelegate {
    (timeStart: Date, timeEnd: Date, timeInterval: TimeInterval): JQueryPromise<any>;
}

export interface IDataResolverDelegate<U> {
    (response: any): IResponse<U>;
}

export interface IResponse<T> {
    data: T[];
    interval: TimeInterval; //keyof typeof TimeInterval;
    dateFrom: Date;
    dateTo: Date;
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
    merge(update: T[]): void;
}

export interface IPendingRequest<T> {
    uid: number;
    request: JQueryPromise<IResponse<T>>;
    interval: TimeInterval;
    range: IRange<Date>;
}
