/**
 * ArrayDataSource tests.
 */
import * as core from '../../../src/lib/core/index';
import * as data from '../../../src/lib/data/index';
import * as model from '../../../src/lib/model/index';

describe('ArrayDataSource tests', () => {

    let testCandlesSet = [];

    beforeEach(() => {
        testCandlesSet = [
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
    });

    it('Empty points source', () => {
        const ads = new data.ArrayDataSource<model.Point>(model.Point, new data.DataSourceConfig(), []);
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 2) }, core.TimeInterval.day);

        expect(iterator).toBeDefined();
        expect(iterator).not.toBeNull();
        expect(iterator.moveNext()).toBe(false);
    });

    it('Test "getData" with normal dataset. Selecting wider range.', () => {
        const ads = new data.ArrayDataSource<model.Candlestick>(model.Candlestick, new data.DataSourceConfig(), testCandlesSet);
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 31) }, core.TimeInterval.day);

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(21);
    });

    it('Test "getData" with normal dataset. Selecting exact range.', () => {
        const ads = new data.ArrayDataSource<model.Candlestick>(model.Candlestick, new data.DataSourceConfig(), testCandlesSet);
        const iterator = ads.getData({ start: new Date(2017, 0, 10), end: new Date(2017, 0, 30) }, core.TimeInterval.day);

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(21);
    });

    it('Test "getData" with normal dataset. Selecting empty range.', () => {
        const ads = new data.ArrayDataSource<model.Candlestick>(model.Candlestick, new data.DataSourceConfig(), testCandlesSet);
        const iterator = ads.getData({ start: new Date(2017, 0, 1), end: new Date(2017, 0, 2) }, core.TimeInterval.day);

        expect(iterator).toBeDefined();
        expect(iterator).not.toBeNull();
        expect(iterator.moveNext()).toBe(false);
    });
});
