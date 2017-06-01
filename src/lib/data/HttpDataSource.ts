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
    //private readonly defaultMinDate = new Date(2000, 0, 1);

    //private readonly defaultMaxItemsRequested = 100;
    protected autoUpdatePeriodSec = 10;
    protected readonly pendingRequests: IPendingRequest<ITimeValue>[] = [];
    protected readonly comparer = (item1: Candlestick, item2: Candlestick) => { return item1.uid.compare(item2.uid); };
//    protected readonly comparer = (item1: ITimeValue, item2: ITimeValue) => { return item1.date.getTime() - item2.date.getTime(); };
    protected timer?: number;
    protected isDisposed = false;

    constructor(
        dataType: { new(d: Date): Candlestick },
        config: HttpDataSourceConfig<ITimeValue, Candlestick>) {
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

            if (this.config.autoupdate) {
                // start autoupdate
                this.scheduleAutoupdate();
            }
    }

    public get config(): HttpDataSourceConfig<ITimeValue, Candlestick> {
        return <HttpDataSourceConfig<ITimeValue, Candlestick>>this._config;
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

    //public getData(itemUid: string, count: number): IDataIterator<T> {
    public load(uid: Uid, count: number): void {
        // HttpDataSource ignores uid.n
        const dateStart = uid.t; // this.uidToDate(itemUid);
        const dateEnd = DateUtils.addInterval(dateStart, this.config.timeInterval, count);
        const range = (count > 0) ? { start: dateStart, end: dateEnd } : { start: dateEnd, end: dateStart };

        return this.getDataInRange(range, this.config.timeInterval);
    }

    //public getDataByDate(date: Date, count: number): IDataIterator<T> {

    // Both UID are inclusive.
    public loadRange(uidFirst: Uid, uidLast: Uid): void {
        const dateFirst = uidFirst.t;
        const dateLast = uidLast.t; //DateUtils.addInterval(date, this.config.timeInterval, count);
        const range = (dateLast > dateFirst) ? { start: dateFirst, end: dateLast } : { start: dateLast, end: dateFirst };

        return this.getDataInRange(range, this.config.timeInterval);
    }

    private getDataInRange(range: IRange<Date>, interval: TimeInterval): void {

        this.validateDateRange(range);
        this.validateInterval(interval);

        const rangesToRequest: IRange<Date>[] = [];

        // 1. Check existing data and define what range needs to be requested
        if (!this.dataStorage.isEmpty) {
            const first = <Candlestick>this.dataStorage.first;
            const last = <Candlestick>this.dataStorage.last;
            const curRange = { start: first.uid.t, end: last.uid.t };
            // Define ranges to request
            if (range.start < curRange.start) {
                rangesToRequest.push({ start: range.start, end: curRange.start });
            }
            if (range.end > curRange.end) {
                rangesToRequest.push({ start: curRange.end, end: range.end });
            }
        } else {
            // Make request for the whole range
            rangesToRequest.push(range);
        }

        // 2. If any requests need to be made.
        for (const r of rangesToRequest) {
            this.makeRequest(r, interval);
        }

        // // 3. So far return what we have
        // const startTime = range.start.getTime();
        // const endTime = range.end.getTime();

        // return this.dataStorage.filter((item: T) => {
        //     const itemTime = item.date.getTime();
        //     return (itemTime >= startTime && itemTime <= endTime);
        // });
    }

    // public getValuesRange(range: IRange<Uid>): IRange<number> {

    //     this.validateRange(range);
    //     //this.validateInterval(interval);

    //     if (this.dataStorage.isEmpty) {
    //         return { start: this.defaultMinValue, end: this.defaultMaxValue };
    //     }

    //     let minValue = Number.MAX_VALUE;
    //     let maxValue = Number.MIN_VALUE;

    //     // Filter data by date and find min/max price
    //     //
    //     // const startTime = range.start.t.getTime();
    //     // const endTime = range.end.t.getTime();
    //     // const iterator = this.dataStorage.getIterator((item: T) => {
    //     //     const itemTime = item.date.getTime();
    //     //     return (itemTime >= startTime && itemTime <= endTime);
    //     // });

    //     const iterator = this.dataStorage.getIterator((item: T) => {
    //         // item >= range.start && item <= range.end
    //         return item.uid.compare(range.start) >= 0 && item.uid.compare(range.end) <= 0;
    //     });

    //     while (iterator.moveNext()) {
    //         // update min / max values
    //         const values = iterator.current.getValues();
    //         const min = Math.min(...values);
    //         const max = Math.max(...values);
    //         if (min < minValue) { minValue = min; }
    //         if (max > maxValue) { maxValue = max; }
    //     }

    //     return { start: minValue, end: maxValue };
    // }

    public setTimeInterval(interval: TimeInterval) {
        // set interval and clear storage
        //
        this.config.timeInterval = interval;
        this.dataStorage.clear(); // = new ArrayDataStorage<T>(this.comparer);
    }

    protected makeRequest(range: IRange<Date>, interval: TimeInterval) {
        if (this.isDisposed) {
            console.debug('Ignoring request from the disposed data source.');
            return;
        }

        let reqStartTime = range.start.getTime();
        let reqEndTime = range.end.getTime();

        // If there are pending requests, compare new request to them and exclude overlapping ranges.
        for (const req of this.pendingRequests) {
            const pendingStart = req.range.start.getTime();
            const pendingEnd = req.range.end.getTime();
            if (reqStartTime >= pendingStart && reqEndTime <= pendingEnd) {
                // Pending requests includes new request. Just ignore new request.
                return;
            } else if (reqStartTime < pendingStart && reqEndTime > pendingStart && reqEndTime <= pendingEnd) {
                reqEndTime = pendingStart; // exclude overlapping end
            } else if (reqEndTime > pendingEnd && reqStartTime >= pendingStart && reqStartTime < pendingEnd) {
                reqStartTime = pendingEnd; // exclude overlapping start
            }
        }

        const reqStartDate = new Date(reqStartTime);
        const reqEndDate = new Date(reqEndTime);

        // Make request
        console.debug(`reading data, interval=${ TimeInterval[this.config.timeInterval] }`);
        const request = this.config.readData(reqStartDate, reqEndDate, this.config.timeInterval);

        // Add new request to collection of pending requests
        const uid = Date.now(); // unique id for request
        this.pendingRequests.push({ uid: uid, request: request, interval: interval, range: { start: reqStartDate, end: reqEndDate }});

        const self = this;
        request
        .then((response: any) => { return self.config.resolveData(response); })
        .then((response: IResponse<Candlestick>) => { self.onRequestResolved(response); })
        .fail((jqXhr: JQueryXHR, textStatus: string, errorThrown: string) => { self.onRequestFailed(jqXhr, textStatus, errorThrown); })
        .always(() => {
            // Remove request from pending requests
            for (let i = 0; i < this.pendingRequests.length; i += 1) {
                if (this.pendingRequests[i].uid === uid) {
                    this.pendingRequests.splice(i, 1);
                }
            }
        });
    }

    protected onRequestResolved(response: IResponse<Candlestick>) {
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
            this.merge(response.data);
            const lastAfter = this.dataStorage.last !== undefined ? this.dataStorage.last.uid : undefined;

            // const arg = new DataChangedArgument(
            //         { start: new Date(response.startDateTime), end: new Date(response.endDateTime) },
            //         timeInterval,
            //         lastDateBefore, lastDateAfter);

            // TODO: Remove conversion
            const uidFirst = response.data[0].uid; // first (new Date(response.startDateTime));
            const uidLast = response.data[response.data.length - 1].uid; // last
            const count = response.data.length;
            const arg = new DataChangedArgument(uidFirst, uidLast, count);
            arg.lastUidBefore = lastBefore;
            arg.lastUidAfter = lastAfter;

            this.computeExtensions(arg);

            console.debug(`HTTP: triggering event ${uidFirst.t.toISOString()}-${uidLast.t.toISOString()}`);
            // Notify subscribers:
            this.dateChangedEvent.trigger(arg);
        }
    }

    protected onRequestFailed(jqXhr: JQueryXHR, textStatus: string, errorThrown: string) {
        console.error('request failed: ' + textStatus);
    }

    protected makeDefaultReader(): IDataReaderDelegate<ITimeValue> {
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

    // private dateToUid(date: Date): string {
    //     return date.getTime().toString();
    // }

    // private uidToDate(uid: string): Date {
    //     return new Date(parseInt(uid, 10));
    // }

    protected makeDefaultResolver(): IDataResolverDelegate<ITimeValue, Candlestick> {
        return (response: IResponse<ITimeValue>) => {
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
                startDateTime: response.startDateTime,
                endDateTime: response.endDateTime
            };
        };
    }

    public merge(data: Candlestick[]) {
        this.dataStorage.merge(data);
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig();
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
