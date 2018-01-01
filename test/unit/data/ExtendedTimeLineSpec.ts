/**
 * CandlestickIteratorExtensions tests.
 */
import * as core from '../../../src/lib/core/index';
import { ArrayDataSource, DataSourceConfig, ExtendedTimeLine } from '../../../src/lib/data/index';
import { Candlestick as Candle, Uid } from '../../../src/lib/model/index';

describe('ExtendedTimeLine tests', () => {

    const snapshot = { timestamp: 0, data: [] };

    beforeEach(() => {
        snapshot.data = [
            createCandle(new Date('2017-01-10T06:00:00.000Z'), 0),  // 10.01 06:00
            createCandle(new Date('2017-01-10T07:00:00.000Z'), 0),
            createCandle(new Date('2017-01-10T08:00:00.000Z'), 0),
            createCandle(new Date('2017-01-10T09:00:00.000Z'), 0),
            createCandle(new Date('2017-01-10T10:00:00.000Z'), 0),
            createCandle(new Date('2017-01-10T11:00:00.000Z'), 0),  // 10.01 11:00

            createCandle(new Date('2017-01-11T00:00:00.000Z'), 0),  // 11.01 00:00
            createCandle(new Date('2017-01-11T01:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T02:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T03:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T04:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T05:00:00.000Z'), 0),  // 11.01 05:00

            createCandle(new Date('2017-01-11T06:00:00.000Z'), 0),  // 11.01 06:00
            createCandle(new Date('2017-01-11T06:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T06:00:00.000Z'), 2),
            createCandle(new Date('2017-01-11T07:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T07:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T07:00:00.000Z'), 2),
            createCandle(new Date('2017-01-11T08:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T08:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T08:00:00.000Z'), 2),
            createCandle(new Date('2017-01-11T09:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T09:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T09:00:00.000Z'), 2),
            createCandle(new Date('2017-01-11T10:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T10:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T10:00:00.000Z'), 2),
            createCandle(new Date('2017-01-11T11:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T11:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T11:00:00.000Z'), 2),  // 11.01 11:00

            createCandle(new Date('2017-01-11T18:00:00.000Z'), 0),  // 11.01 18:00
            createCandle(new Date('2017-01-11T18:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T19:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T19:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T20:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T20:00:00.000Z'), 1),
            createCandle(new Date('2017-01-11T23:00:00.000Z'), 0),
            createCandle(new Date('2017-01-11T23:00:00.000Z'), 1)   // 11.01 23:00
        ];
    });

    it('Iterating over empty data source', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), []);
        const timeLine = new ExtendedTimeLine(ads);

        const startDate = new Date('2017-01-10 01:00Z');
        const iter = timeLine.getIterator(new Uid(startDate, 0), interval);

        for (let i = 0; i < 10; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + (i === 0 ? 0 : 1));
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }
    });

    it('Iterating over existing data starting from smaller uid out of range.', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);

        const startDate = new Date('2017-01-10 01:00Z');
        const iter = timeLine.getIterator(new Uid(startDate, 0), interval);


        for (let i = 0; i < 5; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + (i === 0 ? 0 : 1));
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }

        for (let i = 0; i < snapshot.data.length; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            //startDate.setUTCHours(startDate.getUTCHours() + (i === 0 ? 0 : 1));
            expect(iter.current.equals(snapshot.data[i].uid)).toBe(true);
        }

        startDate = new Date(snapshot.data[snapshot.data.length - 1].uid.t.getTime());

        for (let i = 0; i < 5; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + 1);
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }
    });

    it('Iterating over existing data starting from start of range.', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);

        const startDate = new Date('2017-01-10 06:00Z');
        const iter = timeLine.getIterator(new Uid(startDate, 0), interval);

        for (let i = 0; i < snapshot.data.length; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            expect(iter.current.equals(snapshot.data[i].uid)).toBe(true);
        }

        startDate = new Date(snapshot.data[snapshot.data.length - 1].uid.t.getTime());
        for (let i = 0; i < 5; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + 1);
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }

        expect(snapshot.data[snapshot.data.length - 1].uid.compare(new Uid(new Date('2017-01-11 23:00Z'), 1))).toEqual(0);
    });

    it('Iterating over existing data starting from inside of range.', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);

        const startDate = new Date('2017-01-11 00:00Z');
        const iter = timeLine.getIterator(new Uid(startDate, 0), interval);

        for (let i = 6; i < 38; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            expect(iter.current.equals(snapshot.data[i].uid)).toBe(true);
        }

        startDate = new Date(snapshot.data[snapshot.data.length - 1].uid.t.getTime());
        for (let i = 0; i < 5; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + 1);
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }

        expect(snapshot.data[snapshot.data.length - 1].uid.compare(new Uid(new Date('2017-01-11 23:00Z'), 1))).toEqual(0);
    });

    it('Iterating over existing data starting from large uid out of range.', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);

        const startDate = new Date('2017-01-12 10:00Z');
        const iter = timeLine.getIterator(new Uid(startDate, 0), interval);

        for (let i = 0; i < 5; i += 1) {
            const moved = iter.moveNext();
            expect(moved).toBe(true);

            startDate.setUTCHours(startDate.getUTCHours() + (i === 0 ? 0 : 1));
            expect(iter.current.equals(new Uid(startDate, 0))).toBe(true);
        }
    });

    it('getByDistance tests. With empty data source', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), []);
        const timeLine = new ExtendedTimeLine(ads);
        let next;

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), -1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 00:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), -3, interval);
        expect(next.equals(new Uid(new Date('2017-01-09 22:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 02:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 3, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 04:00Z'), 0))).toBe(true);
    });

    it('getByDistance tests. Starting from smaller uid then existing data', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);
        let next;

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), -1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 00:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), -3, interval);
        expect(next.equals(new Uid(new Date('2017-01-09 22:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 02:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 3, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 04:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 5, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 06:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 6, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 07:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 20, interval);
        expect(next.equals(new Uid(new Date('2017-01-11 07:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 42, interval);
        expect(next.equals(new Uid(new Date('2017-01-11 23:00Z'), 1))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 43, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 00:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 01:00Z'), 0), 44, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 01:00Z'), 0))).toBe(true);
    });

    it('getByDistance tests. Starting inside existing data', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);
        let next;

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 06:00Z'), 0), -1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 05:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 06:00Z'), 0), -3, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 03:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 06:00Z'), 0), 1, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 07:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 06:00Z'), 0), 13, interval);
        expect(next.equals(new Uid(new Date('2017-01-11 06:00Z'), 1))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-10 06:00Z'), 0), 38, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 00:00Z'), 0))).toBe(true);
    });

    it('getByDistance tests. Starting from larger uid then existing data', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);
        let next;

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), 3, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 15:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), 1, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 13:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -1, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 11:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -12, interval);
        expect(next.equals(new Uid(new Date('2017-01-12 00:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -13, interval);
        expect(next.equals(new Uid(new Date('2017-01-11 23:00Z'), 1))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -50, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 06:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -51, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 05:00Z'), 0))).toBe(true);

        next = timeLine.getByDistance(new Uid(new Date('2017-01-12 12:00Z'), 0), -52, interval);
        expect(next.equals(new Uid(new Date('2017-01-10 04:00Z'), 0))).toBe(true);
    });

    it('getDistance tests', () => {
        const interval = core.TimeInterval.hour;
        const ads = new ArrayDataSource(Candle, new DataSourceConfig(0), snapshot.data);
        const timeLine = new ExtendedTimeLine(ads);
        let dist;

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 01:00Z'), 0),
            new Uid(new Date('2017-01-10 01:00Z'), 0),
            interval);
        expect(dist).toEqual(0);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 01:00Z'), 0),
            new Uid(new Date('2017-01-10 06:00Z'), 0),
            interval);
        expect(dist).toEqual(5);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-12 01:00Z'), 0),
            new Uid(new Date('2017-01-12 06:00Z'), 0),
            interval);
        expect(dist).toEqual(5);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 01:00Z'), 0),
            new Uid(new Date('2017-01-12 06:00Z'), 0),
            interval);
        expect(dist).toEqual(49);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 06:00Z'), 0),
            new Uid(new Date('2017-01-11 23:00Z'), 1),
            interval);
        expect(dist).toEqual(37);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 01:00Z'), 0),
            new Uid(new Date('2017-01-10 11:00Z'), 0),
            interval);
        expect(dist).toEqual(10);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 06:00Z'), 0),
            new Uid(new Date('2017-01-10 06:00Z'), 0),
            interval);
        expect(dist).toEqual(0);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 06:00Z'), 0),
            new Uid(new Date('2017-01-10 07:00Z'), 0),
            interval);
        expect(dist).toEqual(1);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-11 20:00Z'), 1),
            new Uid(new Date('2017-01-12 00:00Z'), 0),
            interval);
        expect(dist).toEqual(3);

        dist = timeLine.getDistance(
            new Uid(new Date('2017-01-10 11:00Z'), 0),
            new Uid(new Date('2017-01-11 06:00Z'), 2),
            interval);
        expect(dist).toEqual(9);
    });
});

function createCandle(date: Date, n: number) {
    return new Candle(date, undefined, undefined, undefined, undefined, n);
}
