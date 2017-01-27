/**
 * HttpDataSource class.
 * 
 * @classdesc Data source with dynamic data loading.
 */
import { ChartType, TimeInterval } from '../core/index';
import { Candlestick, ITimeValue } from '../model/index';
import { Event, IEvent, IRange } from '../shared/index';
import { ArrayUtils, IComparer } from '../utils/index';
import { ArrayIterator } from './ArrayIterator';
import { DataChangedEvent } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { DataType } from './DataType';
import { HttpDataSourceConfig } from './HttpDataSourceConfig';
import { DataChangedArgument, IDataIterator, IDataSnapshot, IDataSource, IPendingRequest, IResponse } from './Interfaces';

import * as $ from 'jquery';

type dataReaderFunc<T> = (timeStart: Date, timeEnd: Date, interval: string) => JQueryPromise<IResponse<T>>;

export class HttpDataSource<T extends ITimeValue> extends DataSource<T> {

    protected dataSnapshot: IDataSnapshot<T>;
    private readonly defaultMinDate = new Date(2000, 0, 1);
    private readonly defaultMinValue = 0;
    private readonly defaultMaxValue = 100;
    private readonly defaultMaxItemsRequested = 100;
    private requestedRange: IRange<Date>;

    protected pendingRequests: IPendingRequest<T>[] = [];

    constructor(
        dataType: { new(d: Date): T },
        config: HttpDataSourceConfig<T>) {
            super(dataType, config);
            this.dataSnapshot = {
                data: [],
                timestamp: 0
            };

            if (!config || !config.url) {
                throw new Error('Url is not initialized.');
            }

            this.config.readData = config.readData || this.makeDefaultReader();
    }

    public get config(): HttpDataSourceConfig<T> {
        // TODO: Correct this:
        return <HttpDataSourceConfig<T>>this._config;
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T> {

        this.validateRange(range);
        this.validateInterval(interval);

        const data = this.dataSnapshot.data;

        const rangesToRequest: IRange<Date>[] = [];
        // 1. Check existing data and define what we need to request
        //
        if (data.length > 0) {
            const curRange = { start: data[0].date, end: data[data.length - 1].date };

            // Define range to request
            if (range.start < curRange.start) {
                rangesToRequest.push({ start: range.start, end: curRange.start });
            }
            if (range.end > curRange.end) {
                rangesToRequest.push({ start: curRange.end, end: range.end });
            }
        } else {
            // Make request for whole range
            rangesToRequest.push(range);
        }

        // 2. If the data is not enough - make request and returns what's here.
        //
        if (rangesToRequest.length > 0) {
            for (const r of rangesToRequest) {
                // make request
                this.makeRequest(r, interval);
            }
        } else {
            // If data is enough return it.
        }

        // 3. So far return what we have
        //

        // ... find first and last indexes.
        // TODO: Remove duplicated code
        let startIndex = 0;
        for (startIndex = 0; startIndex < data.length; startIndex += 1) {
            if (data[startIndex].date.getTime() >= range.start.getTime()) {
                break;
            }
        }
        let lastIndex = data.length - 1;
        for (lastIndex = data.length - 1; lastIndex >= startIndex; lastIndex -= 1) {
            if (data[lastIndex].date.getTime() <= range.end.getTime()) {
                break;
            }
        }

        return new ArrayIterator<T>(
            this.dataSnapshot,
            startIndex,
            lastIndex,
            this.dataSnapshot.timestamp);
   }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {

        this.validateRange(range);
        this.validateInterval(interval);

        const data = this.dataSnapshot.data;

        if (data.length === 0) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        data.forEach(item => {
                if (item.date >= range.start && item.date <= range.end) {
                    // update min / max values
                    const values = item.getValues();
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    if (min < minValue) { minValue = min; }
                    if (max > maxValue) { maxValue = max; }
                }
            });

        return { start: minValue, end: maxValue };
    }

    protected makeRequest(range: IRange<Date>, interval: TimeInterval) {

        let reqStartDate = range.start;
        let reqEndDate = range.end;

        // Check pending requests
        if (this.pendingRequests.length > 0) {
            // Find pending requests' range
            let pendingStartDate = new Date(2100, 0, 1);
            let pendingEndDate = new Date(1900, 0, 1);

            for (const req of this.pendingRequests) {
                if (req.range.start < pendingStartDate) { pendingStartDate = req.range.start; }
                if (req.range.end > pendingEndDate) { pendingEndDate = req.range.end; }
            }

            // Correct new requested range
            if (reqStartDate < pendingStartDate) {
                reqEndDate = pendingStartDate; // request older data
            } else if (reqEndDate > pendingEndDate) {
                reqStartDate = pendingEndDate; // request new data
            } else {
                // Pending requests are overlapping new request. Just ignore.
                console.debug('Ignoring new request');
                return;
            }
        } else {
            // just make a new request
        }

        const request = this.config.readData(reqStartDate, reqEndDate, this.timeIntervalToString(interval));

        // Add new request to pending requests
        const uid = Date.now();
        this.pendingRequests.push({ uid: uid, request: request, interval: interval, range: { start: reqStartDate, end: reqEndDate }});

        const self = this;
        request.done((response: IResponse<T>) => {
            if (response && response.data && response.data.length > 0) {
                self.mergeData(response.data);



                // Notify subscribers:
                self.dateChangedEvent.trigger(new DataChangedArgument(
                    { start: new Date(response.startDateTime), end: new Date(response.endDateTime) },
                    self.stringToTimeInterval(response.interval)));
            }
        })
        .fail((jqXHR, textStatus) => {
            console.debug('request failed: ' + jqXHR + textStatus);
        })
        .always((jqXHR, textStatus, errorThrown) => {
            // Remove request from pending requests
            for (let i = 0; i < this.pendingRequests.length; i += 1) {
                if (this.pendingRequests[i].uid === uid) {
                    this.pendingRequests.splice(i, 1);
                }
            }
        });
    }

    private makeDefaultReader(): dataReaderFunc<T> {
        const url = this.config.url;

        return (timeStart: Date, timeEnd: Date, interval: string) => {
            return $.ajax({
                        type: 'get',
                        dataType: 'jsonp',
                        url: url,
                        data: {
                            interval: interval,
                            startDateTime: timeStart.toISOString(),
                            endDateTime: timeEnd.toISOString()
                        }
                    });
        };
    }

    protected mergeData(jsonData: T[]) {

        // Map incoming data to model
        //
        const objects = jsonData
            .filter((el: T) => { return el && el.date; })
            .map((el: T) => {
                const date = new Date(el.date);
                const obj = new this.dataType(date);
                // TODO: Make interface
                (<any>obj).deserialize(el);
                return obj;
            });

        // update current timestamp
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;

        // Import incoming data to the array
        this.dataSnapshot.data = ArrayUtils.merge(this.dataSnapshot.data,
                                                  objects,
                                                  (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
        );
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
}
