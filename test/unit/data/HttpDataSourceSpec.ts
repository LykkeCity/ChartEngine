/**
 * HttpDataSource tests.
 */
import { TimeInterval } from '../../../src/lib/core/index';
import { DataChangedArgument, HttpDataSource, HttpDataSourceConfig, IDataIterator, IResponse } from '../../../src/lib/data/index';
import { Candlestick, ITimeValue } from '../../../src/lib/model/index';
import { IHashTable } from '../../../src/lib/shared/index';

import * as $ from 'jquery';

type dataReaderFunc<T> = (timeStart: Date, timeEnd: Date, interval: string) => JQueryPromise<IResponse<T>>;
type jqDeferred<T> = JQueryDeferred<IResponse<T>>;

describe('HttpDataSource tests', () => {

    const testCandlesSet: IHashTable<any[]> = { };
    let makeDataReader;
    let makeUtcDate;

    const dayIntervals = [
            { date: new Date('2017-01-10'), c: 60.1636, o: 60.0788, h: 60.2795, l: 59.8283 },
            { date: new Date('2017-01-11'), c: 60.0788, o: 59.6046, h: 60.0860, l: 59.6046 },
            { date: new Date('2017-01-12'), c: 59.6046, o: 59.4481, h: 59.7453, l: 59.1128 },
            { date: new Date('2017-01-13'), c: 59.4481, o: 60.4653, h: 60.4653, l: 59.2225 },
            { date: new Date('2017-01-14'), c: 60.4653, o: 60.9133, h: 61.1961, l: 60.2538 },
            { date: new Date('2017-01-15'), c: 60.9133, o: 61.2730, h: 61.2864, l: 60.3812 },
            { date: new Date('2017-01-16'), c: 61.2730, o: 60.4138, h: 61.6339, l: 60.4122 },
            { date: new Date('2017-01-17'), c: 60.4138, o: 60.3297, h: 60.7954, l: 60.1234 },
            { date: new Date('2017-01-18'), c: 60.3297, o: 60.6708, h: 60.7392, l: 60.1193 },
            { date: new Date('2017-01-19'), c: 60.6708, o: 60.9777, h: 60.9777, l: 60.5989 },
            { date: new Date('2017-01-20'), c: 60.9777, o: 61.0564, h: 61.0730, l: 60.7822 },
            { date: new Date('2017-01-21'), c: 61.0564, o: 60.9426, h: 61.3663, l: 60.7854 },
            { date: new Date('2017-01-22'), c: 60.9426, o: 61.1500, h: 61.1675, l: 60.7031 },
            { date: new Date('2017-01-23'), c: 61.1500, o: 61.4518, h: 61.4598, l: 60.8764 },
            { date: new Date('2017-01-24'), c: 61.4518, o: 61.9306, h: 62.0000, l: 61.3300 },
            { date: new Date('2017-01-25'), c: 61.9306, o: 62.0946, h: 62.0946, l: 61.6667 },
            { date: new Date('2017-01-26'), c: 62.0946, o: 61.7310, h: 62.4999, l: 61.4703 },
            { date: new Date('2017-01-27'), c: 61.7310, o: 62.0812, h: 62.1000, l: 61.3483 },
            { date: new Date('2017-01-28'), c: 62.0812, o: 60.6029, h: 62.0812, l: 60.6029 },
            { date: new Date('2017-01-29'), c: 60.6029, o: 61.0442, h: 61.3088, l: 60.4866 },
            { date: new Date('2017-01-30'), c: 61.0442, o: 62.4933, h: 62.4933, l: 60.7425 }
        ];

    const minuteIntervals = [
            { date: new Date('2017-01-10T10:11:58.000Z'), c: 60.1636, o: 60.0788, h: 60.2795, l: 59.8283 },
            { date: new Date('2017-01-10T10:11:59.000Z'), c: 60.0788, o: 59.6046, h: 60.0860, l: 59.6046 },
            { date: new Date('2017-01-10T10:12:00.000Z'), c: 59.6146, o: 59.4481, h: 59.7453, l: 59.1028 },
            { date: new Date('2017-01-10T10:12:01.000Z'), c: 59.6046, o: 59.4481, h: 59.7453, l: 59.1128 },
            { date: new Date('2017-01-10T10:12:02.000Z'), c: 59.4481, o: 60.4653, h: 60.4653, l: 59.2225 },
            { date: new Date('2017-01-10T10:12:03.000Z'), c: 60.4653, o: 60.9133, h: 61.1961, l: 60.2538 },
            { date: new Date('2017-01-10T10:12:04.000Z'), c: 60.9133, o: 61.2730, h: 61.2864, l: 60.3812 },
            { date: new Date('2017-01-10T10:12:05.000Z'), c: 61.2730, o: 60.4138, h: 61.6339, l: 60.4122 },
            { date: new Date('2017-01-10T10:12:06.000Z'), c: 60.4138, o: 60.3297, h: 60.7954, l: 60.1234 },
            { date: new Date('2017-01-10T10:12:07.000Z'), c: 60.3297, o: 60.6708, h: 60.7392, l: 60.1193 },
            { date: new Date('2017-01-10T10:12:08.000Z'), c: 60.6708, o: 60.9777, h: 60.9777, l: 60.5989 },
            { date: new Date('2017-01-10T10:12:09.000Z'), c: 60.9777, o: 61.0564, h: 61.0730, l: 60.7822 },
            { date: new Date('2017-01-10T10:12:10.000Z'), c: 61.0564, o: 60.9426, h: 61.3663, l: 60.7854 },
            { date: new Date('2017-01-10T10:12:11.000Z'), c: 60.9426, o: 61.1500, h: 61.1675, l: 60.7031 },
            { date: new Date('2017-01-10T10:12:12.000Z'), c: 61.1500, o: 61.4518, h: 61.4598, l: 60.8764 },
            { date: new Date('2017-01-10T10:12:13.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:14.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:15.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:16.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:17.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:18.000Z'), c: null, o: undefined, h: null, l: undefined },
            { date: new Date('2017-01-10T10:12:19.000Z'), c: 61.4518, o: 61.9306, h: 62.0000, l: 61.3300 },
            { date: new Date('2017-01-10T10:12:20.000Z'), c: 61.9306, o: 62.0946, h: 62.0946, l: 61.6667 },
            { date: new Date('2017-01-10T10:12:21.000Z'), c: 62.0946, o: 61.7310, h: 62.4999, l: 61.4703 },
            { date: new Date('2017-01-10T10:12:22.000Z'), c: 61.7310, o: 62.0812, h: 62.1000, l: 61.3483 },
            { date: new Date('2017-01-10T10:12:23.000Z'), c: 62.0812, o: 60.6029, h: 62.0812, l: 60.6029 },
            { date: new Date('2017-01-10T10:12:24.000Z'), c: 60.6029, o: 61.0442, h: 61.3088, l: 60.4866 },
            { date: new Date('2017-01-10T10:12:25.000Z'), c: 61.0442, o: 62.4933, h: 62.4933, l: 60.7425 }
        ];

    beforeEach(() => {

        testCandlesSet['1d'] = dayIntervals;
        testCandlesSet['1m'] = minuteIntervals;

        /**
         * Makes an object with function which returns specified data. Used as a mock for a data request.
         * 
         * @param array Data which will be returned as a result of request.
         * @param promise External promise that this function will have to wait before returning data.
         */
        makeDataReader = <T extends ITimeValue>(array: T[], promise?: JQueryPromise<void>) => {
            return {

                readData: (timeStart: Date, timeEnd: Date, interval: string) => {
                    const def = $.Deferred();

                    // filter data
                    const filteredData = array.filter(item => {
                        return (item.date.getTime() >= timeStart.getTime() && item.date.getTime() <= timeEnd.getTime());
                    });

                    //callCounter += 1;
                    const response = {
                            data: filteredData,
                            interval: interval,
                            startDateTime: timeStart,
                            endDateTime: timeEnd
                    };

                    if (promise) {
                        // Resolve created deferred only after external promise is resolved.
                        promise.always(() => def.resolve(response));
                    } else {
                        // If promise is not specified, resolve deferred immediatly
                        def.resolve(response);
                    }

                    return def.promise();
                }
            };
        };

        makeUtcDate = (year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number) => {
            return new Date(Date.UTC(year, month, day || 1, hour || 0, minute || 0, second || 0, ms || 0));
        };
    });

    it('Empty points source', () => {
        const dataReader = makeDataReader(testCandlesSet['1d']);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 2) }, TimeInterval.day);

        expect(iterator).toBeDefined();
        expect(iterator.moveNext()).toBe(false);
        expect(dataReader.readData).toHaveBeenCalled();
    });

    it('Test "getData" with normal dataset. Selecting wider range.', (done) => {
        const $def = $.Deferred();
        const dataReader = makeDataReader(testCandlesSet['1d'], $def);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        // Hooking up event on data update
        let firedEventsCount = 0;
        ads.dateChanged.on((arg: DataChangedArgument) => {
            // After the "dataChanged" is fired loaded data should get accessible
            //

            // Check on events count.
            firedEventsCount += 1;
            if (firedEventsCount > 1) {
                done.fail('Fired more then one dateChange event.');
            }

            // Read data again
            const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) }, TimeInterval.day);

            expect(iterator).toBeDefined();
            //expect(callCounter).toEqual(1);
            expect(dataReader.readData).toHaveBeenCalledTimes(1);

            let count = 0;
            while (iterator.moveNext()) {
                count += 1;
            }
            expect(count).toEqual(testCandlesSet['1d'].length);
            done();
        });

        // Getting data
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) }, TimeInterval.day);

        // Returned iterator must return empty data as this is a first call and data are not loaded yet.
        expect(iterator).toBeDefined();
        expect(iterator.moveNext()).toBe(false);

        // Signal that data request is finished
        $def.resolve();
    });

    it('Test "getData" with normal dataset. Selecting exact range.', () => {
        const dataReader = makeDataReader(testCandlesSet['1m']);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        let iterator;
        let requestedStartDate;
        let requestedEndDate;
        let expectedIntervals;
        let firedEventsCount = 0;
        ads.dateChanged.on((arg: DataChangedArgument) => {
            // count events
            firedEventsCount += 1;

            // validate argument range
            expect(arg.range.start).toEqual(requestedStartDate);
            expect(arg.range.end).toEqual(requestedEndDate);
            expect(arg.interval).toEqual(TimeInterval.min);

            // re-read data
            iterator = ads.getData({ start: requestedStartDate, end: requestedEndDate }, TimeInterval.min);

            // validate data
            expect(iterator).toBeDefined();
            let count = 0;
            while (iterator.moveNext()) { count += 1; }
            expect(count).toEqual(expectedIntervals);
        });

        // Getting 1 interval
        requestedStartDate = makeUtcDate(2017, 0, 10, 10, 11, 59);
        requestedEndDate = makeUtcDate(2017, 0, 10, 10, 11, 59);
        expectedIntervals = 1;
        iterator = ads.getData({ start: requestedStartDate, end: requestedEndDate }, TimeInterval.min);

        // Getting 3 intervals
        requestedStartDate = makeUtcDate(2017, 0, 10, 10, 11, 59);
        requestedEndDate = makeUtcDate(2017, 0, 10, 10, 12, 1);
        expectedIntervals = 3;
        iterator = ads.getData({ start: requestedStartDate, end: requestedEndDate }, TimeInterval.min);

        // Getting 4 intervals
        requestedStartDate = makeUtcDate(2017, 0, 10, 10, 12, 1);
        requestedEndDate = makeUtcDate(2017, 0, 10, 10, 12, 4);
        expectedIntervals = 4;
        iterator = ads.getData({ start: requestedStartDate, end: requestedEndDate }, TimeInterval.min);

        expect(firedEventsCount).toEqual(3);
    });

    it('Test iterator expiration after "changeData" event is fired.', () => {
        const $def = $.Deferred();
        const dataReader = makeDataReader(testCandlesSet['1d'], $def);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        // Getting part of existing data
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 15) }, TimeInterval.day);

        // Initial iterator should be readable and be empty.
        expect(iterator).toBeDefined();
        expect(iterator.moveNext()).toBe(false);

        // Signal that data request is finished
        $def.resolve();

        // Try to read iterator. Iterator should be expired.
        try {
            iterator.moveNext();
            fail('Expecting moveNext to throw as the iterator has become invalid.');
        } catch (e) {
            expect(e.message).toEqual('Data iterator is expired.');
        }
    });

    it('Test "getData" with normal dataset. Selecting the same range twice. Check that no additional request has been made.', (done) => {

        const dataReader = makeDataReader(testCandlesSet['1m']);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        // Hooking up event on data update
        let firedEventsCount = 0;
        ads.dateChanged.on((arg: DataChangedArgument) => {
            // After the "dataChanged" is fired loaded data should get accessible
            //

            // Check on events count.
            firedEventsCount += 1;
            if (firedEventsCount > 1) {
                done.fail('Fired more then one dateChange event.');
            }

            // Read the same interval
            const iterator = ads.getData(
                { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
                TimeInterval.min);

            expect(iterator).toBeDefined();
            let count = 0;
            while (iterator.moveNext()) {
                count += 1;
            }
            expect(count).toEqual(15, 'Expected 15 intervals');
        });

        // Getting data
        const iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        expect(firedEventsCount).toEqual(1, 'Should be exactly 1 data request.');

        done();
    });

    it('Test "getData" with normal dataset. Selecting the same range twice in the same time. Expected one request.', () => {
        const $def = $.Deferred();
        const dataReader = makeDataReader(testCandlesSet['1m'], $def);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        // Hooking up event on data update
        let firedEventsCount = 0;
        ads.dateChanged.on((arg: DataChangedArgument) => {
            // count number of fired events
            firedEventsCount += 1;
        });

        // Making first request
        let iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        // Making second request. This request should not make any data request as it is already requested.
        iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        // Signal that data request is finished
        $def.resolve();

        // Try to read iterator. Iterator should be expired.
        try {
            iterator.moveNext();
            fail('Expecting moveNext to throw as the iterator has become invalid.');
        } catch (e) {
            expect(e.message).toEqual('Data iterator is expired.');
        }

        // refresh iterator
        iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        expect(firedEventsCount).toEqual(1, 'Should be exactly 1 data request.');

        expect(iterator).toBeDefined();
        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(15, 'Expected 15 intervals');
    });

    it('Test "getData" with normal dataset. Selecting two ranges with overlapping dates. Expected two requests.', () => {
        const $def = $.Deferred();
        const dataReader = makeDataReader(testCandlesSet['1m'], $def);
        spyOn(dataReader, 'readData').and.callThrough();

        const httpConfig = new HttpDataSourceConfig<Candlestick>('url', dataReader.readData);
        const ads = new HttpDataSource<Candlestick>(Candlestick, httpConfig);

        // Hooking up event on data update
        let firedEventsCount = 0;
        ads.dateChanged.on((arg: DataChangedArgument) => {
            // Check on events count.
            firedEventsCount += 1;
        });

        // Making first request
        let iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 6) },
            TimeInterval.min);

        // Making second request. This request should trunc request rangle as some data already requested.
        iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 12, 0), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        expect(dataReader.readData).toHaveBeenCalledTimes(2);
        //timeStart: Date, timeEnd: Date, interval: string
        expect(dataReader.readData.calls.argsFor(0))
            .toEqual([makeUtcDate(2017, 0, 10, 10, 11, 58), makeUtcDate(2017, 0, 10, 10, 12, 6), '1m' ]);
        expect(dataReader.readData.calls.argsFor(1))
            .toEqual([makeUtcDate(2017, 0, 10, 10, 12, 6), makeUtcDate(2017, 0, 10, 10, 12, 12), '1m' ]);

        // Signal that data request is finished
        $def.resolve();

        // Try to read iterator. Iterator should be expired.
        try {
            iterator.moveNext();
            fail('Expecting moveNext to throw as the iterator has become invalid.');
        } catch (e) {
            expect(e.message).toEqual('Data iterator is expired.');
        }

        // refresh iterator
        iterator = ads.getData(
            { start: makeUtcDate(2017, 0, 10, 10, 11, 58), end: makeUtcDate(2017, 0, 10, 10, 12, 12) },
            TimeInterval.min);

        expect(firedEventsCount).toEqual(2, 'Should be 2 data requests.');

        expect(iterator).toBeDefined();
        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(15, 'Expected 15 intervals');
    });
});
