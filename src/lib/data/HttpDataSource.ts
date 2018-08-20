/**
 * HttpDataSource class.
 * 
 * @classdesc Data source with dynamic data loading.
 */
import { TimeInterval } from '../core/index';
import { Candlestick, ITimeValue, IUidValue, Uid } from '../model/index';
import { IDisposable, IRange } from '../shared/index';
import { DateUtils } from '../utils/index';
import { ArrayDataStorage } from './ArrayDataStorage';
import { DataChangedArgument } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { HttpDataSourceConfig } from './HttpDataSourceConfig';
import { IDataIterator, IDataReaderDelegate, IDataResolverDelegate, IPendingRequest, IResponse } from './Interfaces';

import * as $ from 'jquery';

export class HttpDataSource extends DataSource {
    protected readonly dataStorage: ArrayDataStorage<Candlestick>;
    protected readonly requestManager: HttpRequestManager;
    //private readonly defaultMinDate = new Date(2000, 0, 1);

    //private readonly defaultMaxItemsRequested = 100;
    protected autoUpdatePeriodSec = 10;
    //protected borderTime: Date|undefined;

    protected readonly comparer = (item1: Candlestick, item2: Candlestick) => { return item1.uid.compare(item2.uid); };
//    protected readonly comparer = (item1: ITimeValue, item2: ITimeValue) => { return item1.date.getTime() - item2.date.getTime(); };
    protected timer?: number;
    protected isDisposed = false;

    constructor(
        dataType: { new(d: Date): Candlestick },
        config: HttpDataSourceConfig<Candlestick>) {
            super(dataType, config);

            if (!config || (!config.url && !config.readData)) {
                throw new Error('Url and readData are not initialized.');
            }
            if (config.timeInterval === undefined) {
                throw new Error('Time interval is not set.');
            }
            this.dataStorage = new ArrayDataStorage<Candlestick>(this.comparer);
            this.config.readData = config.readData || this.makeDefaultReader();
            this.config.resolveData = config.resolveData || this.makeDefaultResolver();
            this.config.autoupdate = (config.autoupdate !== undefined) ? config.autoupdate : false;

            this.requestManager = new HttpRequestManager(this.config.readData, this.config.resolveData);

            if (this.config.autoupdate) {
                // start autoupdate
                this.scheduleAutoupdate();
            }
    }

    public get config(): HttpDataSourceConfig<Candlestick> {
        return <HttpDataSourceConfig<Candlestick>>this._config;
    }

    protected scheduleAutoupdate() {
        this.timer = setTimeout(this.autoUpdate, this.autoUpdatePeriodSec * 1000);
        console.debug(`scheduled autoupdate, timer=${ this.timer }`);
    }

    protected autoUpdate = () => {
        console.debug(`auto update, interval=${ TimeInterval[this.config.timeInterval] }`);

        // Define now and time of last candle
        const now = new Date();

        let lastT = new Date();
        lastT.setDate(lastT.getDate() - 1); // default value is now minus 1 day
        const lastItem = this.dataStorage.last;
        if (lastItem) {
            // Last candle should be also updated
            lastT = DateUtils.substractInterval(lastItem.uid.t, this.config.timeInterval);
        }

        // make request
        this.makeRequest({ start: lastT, end: now }, this.config.timeInterval);

        // schedule next autoupdate
        this.scheduleAutoupdate();
    }

    public getIterator(filter?: (item: Candlestick) => boolean): IDataIterator<Candlestick> {
        // return everything
        return this.dataStorage.getIterator(filter);
    }

    public lock(uid: Uid): void {
        // TODO: When unloading data from memory do not unload specified range.
    }

    public load(uid: Uid, count: number): void {
        // HttpDataSource ignores uid.n
        const dateStart = uid.t;
        const dateEnd = DateUtils.addInterval(dateStart, this.config.timeInterval, count);
        const range = (count > 0) ? { start: dateStart, end: dateEnd } : { start: dateEnd, end: dateStart };

        return this.getDataInRange(range, this.config.timeInterval);
    }

    // Both UID are inclusive.
    public loadRange(uidFirst: Uid, uidLast: Uid): void {
        const dateFirst = uidFirst.t;
        const dateLast = uidLast.t;
        const range = (dateLast > dateFirst) ? { start: dateFirst, end: dateLast } : { start: dateLast, end: dateFirst };

        return this.getDataInRange(range, this.config.timeInterval);
    }

    private getDataInRange(range: IRange<Date>, interval: TimeInterval): void {

        this.validateDateRange(range);
        this.validateInterval(interval);

        this.makeRequest(range, interval);
    }

    public setTimeInterval(interval: TimeInterval) {
        // set interval and clear storage
        //
        this.config.timeInterval = interval;
        this.dataStorage.clear();
        this.requestManager.clear();
    }

    protected makeRequest(range: IRange<Date>, interval: TimeInterval) {
        if (this.isDisposed) {
            console.debug('Ignoring request from the disposed data source.');
            return;
        }

        // Make request
        const promises = this.requestManager.makeRequest(range, this.config.timeInterval);

        const self = this;
        for (const promise of promises) {
            promise
            .then(this.onResolved);
        }
    }

    protected onResolved = (response: IResponse<Candlestick>) => {
        if (this.isDisposed) {
            console.debug('Ignoring response to the disposed data source.');
            return;
        }

        if (response && response.data && response.data.length > 0) {

            const timeInterval = response.interval; //this.stringToTimeInterval(response.interval);
            if (timeInterval !== this.config.timeInterval) {
                // if timeinterval changed ignore response
                console.debug(`Ignoring request with wrong time interval ${timeInterval}`);
                return;
            }

            // Update data
            //
            const lastBefore = this.dataStorage.last !== undefined ? this.dataStorage.last.uid : undefined;
            this.dataStorage.merge(response.data);
            const lastAfter = this.dataStorage.last !== undefined ? this.dataStorage.last.uid : undefined;

            const uidFirst = response.data[0].uid;
            const uidLast = response.data[response.data.length - 1].uid; // last
            const count = response.data.length;
            const arg = new DataChangedArgument(uidFirst, uidLast, count);
            arg.lastUidBefore = lastBefore;
            arg.lastUidAfter = lastAfter;

            // Update borderTime. It can only increase.
            //this.borderTime = (this.borderTime === undefined || this.borderTime < uidLast.t) ? uidLast.t : this.borderTime;

            this.computeExtensions(arg);

            console.debug(`HTTP: triggering event ${uidFirst.t.toISOString()}-${uidLast.t.toISOString()}`);
            // Notify subscribers:
            this.dateChangedEvent.trigger(arg);
        }
    }

    protected makeDefaultReader(): IDataReaderDelegate {
        const url = this.config.url;
        const timeIntervalToString = this.timeIntervalToString;
        return (timeStart: Date, timeEnd: Date, interval: TimeInterval) => {
            const settings: JQueryAjaxSettings = {
                method: 'GET',
                dataType: 'jsonp',
                url: url,
                data: {
                    interval: timeIntervalToString(interval),
                    startDateTime: timeStart.toISOString(),
                    endDateTime: timeEnd.toISOString()
                }
            };
            return $.ajax(settings);
        };
    }

    protected makeDefaultResolver(): IDataResolverDelegate<Candlestick> {
        return (response: any): IResponse<Candlestick> => {
            // Map incoming data to model
            //
            const objects = response.data
                .filter((el: any) => { return el && el.date; })
                .map((el: any) => {
                        const date = new Date(el.date);
                        const obj: Candlestick = new this.dataType(date);
                        (<any>obj).deserialize(el);

                        //obj.uid = this.dateToUid(el.date);

                        return obj;
                });

            return {
                data: objects,
                interval: response.interval,
                dateFrom: new Date(response.startDateTime),
                dateTo: new Date(response.endDateTime)
            };
        };
    }

    public merge(data: Candlestick[]) {

        if (data && data.length > 0) {
            const lastBefore = this.dataStorage.last !== undefined ? this.dataStorage.last.uid : undefined;
            this.dataStorage.merge(data);
            const lastAfter = this.dataStorage.last !== undefined ? this.dataStorage.last.uid : undefined;

            const uidFirst = data[0].uid;
            const uidLast = data[data.length - 1].uid; // last
            const count = data.length;
            const arg = new DataChangedArgument(uidFirst, uidLast, count);
            arg.lastUidBefore = lastBefore;
            arg.lastUidAfter = lastAfter;

            // Notify subscribers:
            this.dateChangedEvent.trigger(arg);
        }
    }

    protected timeIntervalToString(interval: TimeInterval): string {
        return TimeInterval[interval];
    }

    protected stringToTimeInterval(interval: keyof typeof TimeInterval): TimeInterval {
        return TimeInterval[interval];
    }

    public dispose() {
        if (this.timer) {
            console.debug(`dispose, timer=${ this.timer }`);
            clearTimeout(this.timer);
        }
        this.isDisposed = true;
    }
}

export interface IPendingPromise {
    //uid: number;
    resolve?: (value?: {} | PromiseLike<{}>| undefined) => void;
    //interval: TimeInterval;
    range: IRange<Date>;
}

/**
 * 
 */
export class HttpRequestManager {

    private total = new CompositeRange();
    private readonly reader: IDataReaderDelegate;
    private readonly resolver: IDataResolverDelegate<Candlestick>;
    protected readonly queue: IPendingPromise[] = [];
    private isRunningRequest = false;
    private readonly throttle = 100; // milliseconds

    constructor(reader: IDataReaderDelegate, resolver: IDataResolverDelegate<Candlestick>) {
        this.reader = reader;
        this.resolver = resolver;
    }

    public clear() {
        this.total.clear();
    }

    public makeRequest(range: IRange<Date>, interval: TimeInterval, force: boolean = false): Promise<any>[] {

        let ranges = [range];
        if (!force) {
            // Check loaded range
            ranges = this.total.diff(range);

            if (ranges.length === 0) { return []; }
        }

        // 2. Check the queue; filter out intersections with pending requests.

        const filteredRanges = [];
        for (const requestedRange of ranges) {

            let reqStartTime = requestedRange.start.getTime();
            let reqEndTime = requestedRange.end.getTime();

            // If there are pending requests, compare new request to them and exclude overlapping ranges.
            for (const req of this.queue) {
                const pendingStart = req.range.start.getTime();
                const pendingEnd = req.range.end.getTime();
                if (reqStartTime >= pendingStart && reqEndTime <= pendingEnd) {
                    // Pending requests includes new request. Just ignore new request.
                    return[];
                } else if (reqStartTime < pendingStart && reqEndTime > pendingStart && reqEndTime <= pendingEnd) {
                    reqEndTime = pendingStart; // exclude overlapping end
                } else if (reqEndTime > pendingEnd && reqStartTime >= pendingStart && reqStartTime < pendingEnd) {
                    reqStartTime = pendingEnd; // exclude overlapping start
                }
            }

            filteredRanges.push({ start: new Date(reqStartTime), end: new Date(reqEndTime) });
        }

        if (filteredRanges.length === 0) {
            return [];
        }

        // 3. Push requested ranges to queue
        const promises = [];
        const self = this;

        for (const req of filteredRanges) {

            const queuedPromise = new Promise((resolved, rejected) => {
                this.queue.push({ resolve: resolved, range: req });
            });

            const promise = new Promise((resolved, rejected) => {

                // Add new request to collection of pending requests

                queuedPromise.then(() => {
                    const request = this.reader(req.start, req.end, interval);

                    request
                    .then(this.resolver)
                    .then((resp: IResponse<Candlestick>) => { self.onSucceeded(resp); resolved(resp); })
                    .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string) => { self.onFailed(jqXhr, textStatus, errorThrown); rejected(errorThrown); });
                });
            });
            promises.push(promise);
        }

        // 4. Kick off requests if they are not kicked off yet
        if (!this.isRunningRequest) {
            this.sendRequest();
        }

        return promises;
    }

    private sendRequest = () => {
        // Send first request in queue and schedule next one
        const promise = this.queue.shift();
        if (promise) {
            this.isRunningRequest = true;

            // start request
            if (promise.resolve) {
                promise.resolve();
            } else {
                throw new Error('Resolve function is not initialized.');
            }

            // schedule next request
            setTimeout(this.sendRequest, this.throttle);
        } else {
            this.isRunningRequest = false;
        }
    }

    private onSucceeded = (response: IResponse<Candlestick>) => {
		// If no errors append range
        this.total.append({ start: response.dateFrom, end: response.dateTo });
    }

    private onFailed = (jqXhr: JQueryXHR, textStatus: string, errorThrown: string) => {
        console.error(`Request failed: ${textStatus} ${errorThrown}`);
    }
}

class Node<T> {
    constructor(
        public data: T,
        public start: boolean,
        public prev?: Node<T>,
        public next?: Node<T>) {
    }
}

export class CompositeRange {
    private start: Node<Date> = new Node<Date>(new Date(1900, 0), false);

    constructor() {
    }

    /**
     * Appends specified range.
     * @param range
     */
    public append(range: IRange<Date>): void {

        let S = range.start.getTime();
        let E = range.end.getTime();

        let prev = undefined;
        let cur = this.start;

        // 1. Insert range.start
        //
        let handledS = false;
        while (cur.next) {
            prev = cur;
            cur = cur.next;

            if (cur.start) {
                const Rs = cur.data.getTime();
                if (S < Rs) {
                    // Insert S, move to next point, go to insert E
                    const node = new Node<Date>(new Date(S), true, prev, cur);
                    prev.next = node;
                    cur.prev = node;

                    cur = node;

                    // prev = node;    // go to next
                    // cur = node.next;
                    handledS = true;
                    break;
                } else if (S === Rs) {
                    // Do not insert S, move to next point go to insert E

                    // prev = cur;    // go to next
                    // cur = cur.next;
                    handledS = true;
                    break;
                } else { // S > Rs
                    continue;
                }
            } else {
                const Re = cur.data.getTime();
                if (S < Re) {
                    // Do not insert anything, go to insert E

                    cur = prev; // step back

                    // prev = cur;    // go to next
                    // cur = cur.next;
                    handledS = true;
                    break;
                } else if (S === Re) {
                    // Remove Re, go to insert E, stay on current point

                    prev.next = cur.next;
                    if (cur.next) { cur.next.prev = prev; }
                    cur = prev;

                    handledS = true;
                    break;
                } else { // S > Re
                    continue;
                }
            }
        }

        // 2. Insert range.end
        //
        let handledE = false;
        while (cur.next) {

            prev = cur;
            cur = cur.next;

            if (cur.start) {
                const Rs = cur.data.getTime();
                if (E < Rs) {
                    // Insert E, finish

                    const node = new Node<Date>(new Date(E), false, prev, cur);
                    prev.next = node;
                    cur.prev = node;

                    handledE = true;
                    break;
                } else if (E === Rs) {
                    // Remove Rs and finish

                    prev.next = cur.next;
                    if (cur.next) { cur.next.prev = prev; }

                    handledE = true;
                    break;
                } else { // E > Rs
                    // Remove Rs and continue

                    prev.next = cur.next;
                    if (cur.next) { cur.next.prev = prev; }
                    cur = prev;
                }
            } else {
                const Re = cur.data.getTime();
                if (E <= Re) {
                    // Do nothing, finish
                    handledE = true;
                    break;
                } else { // E > Re
                    // Remove Re and continue

                    prev.next = cur.next;
                    if (cur.next) { cur.next.prev = prev; }
                    cur = prev;
                }
            }
        }

        // Case 1: If no ranges yet  => insert S and E
        // Case 2: S > all     => insert S and E
        // Case 3: E > last    => insert E

        if (!handledS) {
            // insert S
            const node = new Node<Date>(new Date(S), true, cur, cur.next);
            cur.next = node;
            if (cur.next) { cur.next.prev = node; }
            cur = node;
        }

        if (!handledE) {
            // insert E
            const node = new Node<Date>(new Date(E), false, cur, cur.next);
            cur.next = node;
            if (cur.next) { cur.next.prev = node; }
        }
    }

    public clear(): void {
        this.start.next = undefined;
    }

    /**
     * Checks if the specified range intersects composite range.
     * Returns difference.
     * @param range 
     */
    public diff(range: IRange<Date>): IRange<Date>[] {

        const ranges: Range[] = [];
        let curRange: Range|undefined;
        let mode = true; // start, end

        let S = range.start.getTime();
        const E = range.end.getTime();

        let prev = this.start;
        let cur = this.start;

        let finished = false;

        while (cur.next) {
            prev = cur;
            cur = cur.next;

            if (mode === true) { // mode for start

                if (cur.start) {
                    const Rs = cur.data.getTime();

                    if (S < Rs) {
                        // Create new range, go to end mode

                        curRange = new Range(new Date(S), new Date(S));
                        mode = false; // end mode

                        cur = prev; // go back one step
                        continue;
                    } else if (S > Rs) {
                        continue;
                    } else { // S === Rs
                        if (cur.next) {
                            const Re = cur.next.data.getTime();

                            if (E <= Re) {
                                // Return what's there
                                finished = true;
                                break;
                            } else {
                                // S = next Re, continue
                                S = Re;
                                continue;
                            }
                        } else {
                            throw new Error('End time is not found');
                        }
                    }

                } else {
                    const Re = cur.data.getTime();

                    if (S < Re) {
                        S = Re;
                        if (E < S) {
                            finished = true;
                        }
                        curRange = new Range(new Date(S), new Date(S));
                        mode = false;
                        continue;
                    } else if (S >= Re) {
                        // Skip
                        continue;
                    }
                }
            } else { // mode for end

                if (cur.start) {
                    const Rs = cur.data.getTime();

                    if (E <= Rs) {
                        if (curRange) {
                            curRange.end = new Date(E);
                            ranges.push(curRange);
                        } else {
                            throw new Error('Range is not created');
                        }
                        finished = true;
                        break;
                    } else { // (E > Rs)
                        if (curRange) {
                            curRange.end = new Date(Rs);
                            ranges.push(curRange);
                        } else {
                            throw new Error('Range is not created');
                        }
                        S = Rs;

                        mode = true; // start mode
                        cur = prev; // go back one step
                        continue;
                    }
                } else {
                    const Re = cur.data.getTime();
                    throw new Error('Unexpected condition.');
                }
            }
        }

        if (!finished) {
            ranges.push({ start: new Date(S), end: new Date(E) });
        }

        return ranges;
    }
}

class Range implements IRange<Date> {
    constructor(
        public start: Date,
        public end: Date) {
    }
}
