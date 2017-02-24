/**
 * HttpDataSource class.
 * 
 * @classdesc Data source with dynamic data loading.
 */
import { TimeInterval } from '../core/index';
import { ITimeValue } from '../model/index';
import { IDisposable, IRange } from '../shared/index';
import { DateUtils } from '../utils/index';
import { ArrayDataStorage } from './ArrayDataStorage';
import { DataChangedArgument } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { HttpDataSourceConfig } from './HttpDataSourceConfig';
import { IDataIterator, IDataReaderDelegate, IDataResolverDelegate, IDataStorage, IPendingRequest, IResponse } from './Interfaces';

import * as $ from 'jquery';

export class HttpDataSource<T extends ITimeValue> extends DataSource<T> implements IDisposable {
    protected dataStorage: IDataStorage<T>;
    //private readonly defaultMinDate = new Date(2000, 0, 1);
    private readonly defaultMinValue = 0;
    private readonly defaultMaxValue = 100;
    //private readonly defaultMaxItemsRequested = 100;
    protected autoUpdatePeriodSec = 10;
    protected pendingRequests: IPendingRequest<T>[] = [];
    protected comparer = (item1: ITimeValue, item2: ITimeValue) => { return item1.date.getTime() - item2.date.getTime(); };
    protected timer?: number;

    constructor(
        dataType: { new(d: Date): T },
        config: HttpDataSourceConfig<T>) {
            super(dataType, config);

            if (!config || (!config.url && !config.readData)) {
                throw new Error('Url and readData are not initialized.');
            }
            this.dataStorage = new ArrayDataStorage<T>(this.comparer);
            this.config.readData = config.readData || this.makeDefaultReader();
            this.config.resolveData = config.resolveData || this.makeDefaultResolver();
            this.config.autoupdate = (config.autoupdate !== undefined) ? config.autoupdate : false;

            if (this.config.autoupdate) {
                // start autoupdate
                this.scheduleAutoupdate();
            }
    }

    public get config(): HttpDataSourceConfig<T> {
        return <HttpDataSourceConfig<T>>this._config;
    }

    protected scheduleAutoupdate() {
        this.timer = setTimeout(this.autoUpdate, this.autoUpdatePeriodSec * 1000);
    }

    protected autoUpdate = () => {
        console.debug('auto update');
        // TODO: make interval public member and use in ChartBoard
        const interval: TimeInterval = TimeInterval.min;

        // Define now and time of last candle
        const now = new Date();

        let lastT = new Date();
        lastT.setDate(lastT.getDate() - 1); // default value is now minus 1 day
        const lastItem = this.dataStorage.last;
        if (lastItem) {
            // Last candle should be also updated
            lastT = DateUtils.substractInterval(lastItem.date, interval);
        }

        // make request
        this.makeRequest({ start: lastT, end: now }, interval);

        // schedule next autoupdate
        this.scheduleAutoupdate();
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T> {

        this.validateRange(range);
        this.validateInterval(interval);

        const rangesToRequest: IRange<Date>[] = [];

        // 1. Check existing data and define what range needs to be requested
        if (!this.dataStorage.isEmpty) {
            const first = <T>this.dataStorage.first;
            const last = <T>this.dataStorage.last;
            const curRange = { start: first.date, end: last.date };
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

        // 3. So far return what we have
        const startTime = range.start.getTime();
        const endTime = range.end.getTime();

        return this.dataStorage.getIterator((item: T) => {
            const itemTime = item.date.getTime();
            return (itemTime >= startTime && itemTime <= endTime);
        });
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {

        this.validateRange(range);
        this.validateInterval(interval);

        if (this.dataStorage.isEmpty) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        const startTime = range.start.getTime();
        const endTime = range.end.getTime();
        const iterator = this.dataStorage.getIterator((item: T) => {
            const itemTime = item.date.getTime();
            return (itemTime >= startTime && itemTime <= endTime);
        });

        while (iterator.moveNext()) {
            // update min / max values
            const values = iterator.current.getValues();
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min < minValue) { minValue = min; }
            if (max > maxValue) { maxValue = max; }
        }

        return { start: minValue, end: maxValue };
    }

    protected makeRequest(range: IRange<Date>, interval: TimeInterval) {
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
        const request = this.config.readData(reqStartDate, reqEndDate, this.timeIntervalToString(interval));

        // Add new request to collection of pending requests
        const uid = Date.now(); // unique id for request
        this.pendingRequests.push({ uid: uid, request: request, interval: interval, range: { start: reqStartDate, end: reqEndDate }});

        const self = this;
        request
        .then((response: any) => { return self.config.resolveData(response); })
        .then((response: IResponse<T>) => { self.onRequestResolved(response); })
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

    protected onRequestResolved(response: IResponse<T>) {
        if (response && response.data && response.data.length > 0) {
            // Update data
            this.mergeData(response.data);
            // Notify subscribers:
            this.dateChangedEvent.trigger(
                new DataChangedArgument({ start: new Date(response.startDateTime), end: new Date(response.endDateTime) },
                                        this.stringToTimeInterval(response.interval)));
        }
    }

    protected onRequestFailed(jqXhr: JQueryXHR, textStatus: string, errorThrown: string) {
        console.debug('request failed: ' + textStatus);
    }

    protected makeDefaultReader(): IDataReaderDelegate<T> {
        const url = this.config.url;

        return (timeStart: Date, timeEnd: Date, interval: string) => {
            const settings: JQueryAjaxSettings = {
                method: 'GET',
                dataType: 'jsonp',
                url: url,
                data: {
                    interval: interval,
                    startDateTime: timeStart.toISOString(),
                    endDateTime: timeEnd.toISOString()
                }
            };
            return $.ajax(settings);
        };
    }

    protected makeDefaultResolver(): IDataResolverDelegate<T> {
        return (response) => response;
    }

    protected mergeData(jsonData: T[]) {

        // Map incoming data to model
        //
        const objects = jsonData
            .filter((el: T) => { return el && el.date; })
            .map((el: T) => {
                    const date = new Date(el.date);
                    const obj = new this.dataType(date);
                    (<any>obj).deserialize(el);
                    return obj;
            });

        this.dataStorage.merge(objects);
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig();
    }

    protected timeIntervalToString(interval: TimeInterval): string {
        switch (interval) {
            case TimeInterval.month: return '1mo';
            case TimeInterval.day7: return '1w';
            case TimeInterval.day: return '1d';
            case TimeInterval.hour4: return '4h';
            case TimeInterval.hour: return '1h';
            case TimeInterval.min30: return '30m';
            case TimeInterval.min15: return '15m';
            case TimeInterval.min5: return '5m';
            case TimeInterval.min: return '1m';
            default:
                throw new Error('Unexpected TimeInterval value ' + interval);
        }
    }

    protected stringToTimeInterval(interval: string): TimeInterval {
        switch (interval) {
            case '1mo': return TimeInterval.month;
            case '1w': return TimeInterval.day7;
            case '1d': return TimeInterval.day;
            case '4h': return TimeInterval.hour4;
            case '1h': return TimeInterval.hour;
            case '30m': return TimeInterval.min30;
            case '15m': return TimeInterval.min15;
            case '5m': return TimeInterval.min5;
            case '1m': return TimeInterval.min;
            default:
                throw new Error('Unexpected "interval" value ' + interval);
        }
    }

    public dispose() {
        if (this.timer) {
            clearTimeout(this.timer);
        }
    }
}
