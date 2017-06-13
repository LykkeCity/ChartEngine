/**
 * ArrayDataSource tests.
 */
import * as core from '../../../src/lib/core/index';
import * as data from '../../../src/lib/data/index';
import * as model from '../../../src/lib/model/index';
import Candlestick = model.Candlestick;

describe('ArrayDataSource tests', () => {

    let testCandlesSet: model.Candlestick[] = [];
    let makeUtcDate;

    beforeEach(() => {
        testCandlesSet = [
            new Candlestick(new Date('2017-01-10T00:00:00.000Z'), 60.1636, 60.0788, 60.2795, 59.8283),
            new Candlestick(new Date('2017-01-11T00:00:00.000Z'), 60.0788, 59.6046, 60.0860, 59.6046),
            new Candlestick(new Date('2017-01-12T00:00:00.000Z'), 59.6046, 59.4481, 59.7453, 59.1128),
            new Candlestick(new Date('2017-01-13T00:00:00.000Z'), 59.4481, 60.4653, 60.4653, 59.2225),
            new Candlestick(new Date('2017-01-14T00:00:00.000Z'), 60.4653, 60.9133, 61.1961, 60.2538),
            new Candlestick(new Date('2017-01-15T00:00:00.000Z'), 60.9133, 61.2730, 61.2864, 60.3812),
            new Candlestick(new Date('2017-01-16T00:00:00.000Z'), 61.2730, 60.4138, 61.6339, 60.4122),
            new Candlestick(new Date('2017-01-17T00:00:00.000Z'), 60.4138, 60.3297, 60.7954, 60.1234),
            new Candlestick(new Date('2017-01-18T00:00:00.000Z'), 60.3297, 60.6708, 60.7392, 60.1193),
            new Candlestick(new Date('2017-01-19T00:00:00.000Z'), 60.6708, 60.9777, 60.9777, 60.5989),
            new Candlestick(new Date('2017-01-20T00:00:00.000Z'), 60.9777, 61.0564, 61.0730, 60.7822),
            new Candlestick(new Date('2017-01-21T00:00:00.000Z'), 61.0564, 60.9426, 61.3663, 60.7854),
            new Candlestick(new Date('2017-01-22T00:00:00.000Z'), 60.9426, 61.1500, 61.1675, 60.7031),
            new Candlestick(new Date('2017-01-23T00:00:00.000Z'), 61.1500, 61.4518, 61.4598, 60.8764),
            new Candlestick(new Date('2017-01-24T00:00:00.000Z'), 61.4518, 61.9306, 62.0000, 61.3300),
            new Candlestick(new Date('2017-01-25T00:00:00.000Z'), 61.9306, 62.0946, 62.0946, 61.6667),
            new Candlestick(new Date('2017-01-26T00:00:00.000Z'), 62.0946, 61.7310, 62.4999, 61.4703),
            new Candlestick(new Date('2017-01-27T00:00:00.000Z'), 61.7310, 62.0812, 62.1000, 61.3483),
            new Candlestick(new Date('2017-01-28T00:00:00.000Z'), 62.0812, 60.6029, 62.0812, 60.6029),
            new Candlestick(new Date('2017-01-29T00:00:00.000Z'), 60.6029, 61.0442, 61.3088, 60.4866),
            new Candlestick(new Date('2017-01-30T00:00:00.000Z'), 61.0442, 62.4933, 62.4933, 60.7425)
        ];

        makeUtcDate = (year: number, month: number, day?: number, hour?: number, minute?: number, second?: number, ms?: number): Date => {
            return new Date(Date.UTC(year, month, day || 1, hour || 0, minute || 0, second || 0, ms || 0));
        };
    });

    it('Empty points source', () => {
        const d1 = makeUtcDate(2017, 0, 1).getTime();
        const d2 = makeUtcDate(2017, 0, 2).getTime();
        const ads = new data.ArrayDataSource(Candlestick, new data.DataSourceConfig(), []);
        const iterator = ads.getIterator(item => item.date.getTime() >= d1 && item.date.getTime() <= d2);

        expect(iterator).toBeDefined();
        expect(iterator).not.toBeNull();
        expect(iterator.moveNext()).toBe(false);
    });

    it('Test "getData" with normal dataset. Selecting wider range.', () => {
        const d1 = makeUtcDate(2017, 0, 1).getTime();
        const d2 = makeUtcDate(2017, 0, 31).getTime();
        const ads = new data.ArrayDataSource(Candlestick, new data.DataSourceConfig(), testCandlesSet);

        const iterator = ads.getIterator(item => item.date.getTime() >= d1 && item.date.getTime() <= d2);

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(21);
    });

    it('Test "getData" with normal dataset. Selecting subset.', () => {
        const d1 = makeUtcDate(2017, 0, 18).getTime();
        const d2 = makeUtcDate(2017, 0, 21).getTime();
        const ads = new data.ArrayDataSource(Candlestick, new data.DataSourceConfig(), testCandlesSet);
        const iterator = ads.getIterator(item => item.date.getTime() >= d1 && item.date.getTime() <= d2);

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(4);
    });

    it('Test "getData" with normal dataset. Selecting exact range.', () => {
        const d10 = makeUtcDate(2017, 0, 10).getTime();
        const d11 = makeUtcDate(2017, 0, 11).getTime();
        const d12 = makeUtcDate(2017, 0, 12).getTime();
        const d30 = makeUtcDate(2017, 0, 30).getTime();

        const ads = new data.ArrayDataSource(Candlestick, new data.DataSourceConfig(), testCandlesSet);

        // Selecting whole range
        let iterator = ads.getIterator(item => item.date.getTime() >= d10 && item.date.getTime() <= d30);
        let count = 0;
        while (iterator.moveNext()) { count += 1; }
        expect(count).toEqual(21);

        // Selecting 1 item
        iterator = ads.getIterator(item => item.date.getTime() >= d11 && item.date.getTime() <= d11);
        count = 0;
        while (iterator.moveNext()) { count += 1; }
        expect(count).toEqual(1);

        // Selecting 2 item
        iterator = ads.getIterator(item => item.date.getTime() >= d11 && item.date.getTime() <= d12);
        count = 0;
        while (iterator.moveNext()) { count += 1; }
        expect(count).toEqual(2);
    });

    it('Test "getData" with normal dataset. Selecting empty range.', () => {
        const d1 = makeUtcDate(2017, 0, 1).getTime();
        const d2 = makeUtcDate(2017, 0, 2).getTime();
        const ads = new data.ArrayDataSource(Candlestick, new data.DataSourceConfig(), testCandlesSet);
        const iterator = ads.getIterator(item => item.date.getTime() >= d1 && item.date.getTime() <= d2);

        expect(iterator).toBeDefined();
        expect(iterator).not.toBeNull();
        expect(iterator.moveNext()).toBe(false);
    });
});
