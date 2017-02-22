/**
 * ArrayDataStorage tests.
 */
import * as core from '../../../src/lib/core/index';
import * as data from '../../../src/lib/data/index';
import * as model from '../../../src/lib/model/index';

describe('ArrayDataStorage tests', () => {

    const comparer = (item1: model.ITimeValue, item2: model.ITimeValue) => { return item1.date.getTime() - item2.date.getTime(); };
    let targetCandles = [];
    let updateCandles = [];

    const customMatchers = {
        toBeSorted: (util, customEqualityTesters) => {
            return {
                compare: (actual, expected) => {

                    const result = { pass: true, message: '' };

                    if (!actual || !actual.length) {
                        throw new Error('Expected array');
                    }

                    for (let i = 1; i < actual.length; i += 1) {
                        if (comparer(actual[i - 1], actual[i]) > 0) {
                            result.pass = false;
                            break;
                        }
                    }

                    if (result.pass) {
                        result.message = 'Array is expected not to be sorted';
                    } else {
                        result.message = 'Array is expected to be sorted';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach(() => {
        jasmine.addMatchers(customMatchers);

        targetCandles = [
            // unsorted
            { date: new Date('2017-01-13T00:00:00.000Z'), c: 59.4481, o: 60.4653, h: 60.4653, l: 59.2225 },
            { date: new Date('2017-01-15T00:00:00.000Z'), c: 60.9133, o: 61.2730, h: 61.2864, l: 60.3812 },
            { date: new Date('2017-01-10T00:00:00.000Z'), c: 60.1636, o: 60.0788, h: 60.2795, l: 59.8283 },
            { date: new Date('2017-01-12T00:00:00.000Z'), c: 59.6046, o: 59.4481, h: 59.7453, l: 59.1128 },
            { date: new Date('2017-01-11T00:00:00.000Z'), c: 60.0788, o: 59.6046, h: 60.0860, l: 59.6046 },
            { date: new Date('2017-01-14T00:00:00.000Z'), c: 60.4653, o: 60.9133, h: 61.1961, l: 60.2538 }
        ];

        updateCandles = [
            // unsorted
            { date: new Date('2017-01-16T00:00:00.000Z'), c: 61.2730, o: 60.4138, h: 61.6339, l: 60.4122 },
            { date: new Date('2017-01-17T00:00:00.000Z'), c: 60.4138, o: 60.3297, h: 60.7954, l: 60.1234 },
            { date: new Date('2017-01-15T00:00:00.000Z'), c: 60.1636, o: 60.0788, h: 60.2795, l: 59.8283 },
            { date: new Date('2017-01-14T00:00:00.000Z'), c: 59.6046, o: 59.4481, h: 59.7453, l: 59.1128 },
            { date: new Date('2017-01-19T00:00:00.000Z'), c: 60.6708, o: 60.9777, h: 60.9777, l: 60.5989 },
            { date: new Date('2017-01-18T00:00:00.000Z'), c: 60.3297, o: 60.6708, h: 60.7392, l: 60.1193 }
        ];
    });

    it('Empty storage', () => {
        const storage = new data.ArrayDataStorage<model.Point>(comparer, []);

        expect(storage.isEmpty).toBe(true);
        expect(storage.first).toBeUndefined();
        expect(storage.last).toBeUndefined();
    });

    it('Operations with sorted arrays.', () => {
        // First make sure arrays are sorted
        //
        targetCandles.sort(comparer);
        updateCandles.sort(comparer);
        expect(targetCandles).toBeSorted();
        expect(updateCandles).toBeSorted();

        const storage = new data.ArrayDataStorage<model.Point>(comparer, targetCandles);
        storage.merge(updateCandles);

        const iterator = storage.getIterator();

        expect(storage.isEmpty).toBe(false);
        expect(iterator).toBeDefined();

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(10);
    });

    it('Operations with not sorted arrays.', () => {
        // First make sure arrays are not sorted
        //
        expect(targetCandles).not.toBeSorted();
        expect(updateCandles).not.toBeSorted();

        const storage = new data.ArrayDataStorage<model.Point>(comparer, targetCandles);
        storage.merge(updateCandles);

        const iterator = storage.getIterator();

        expect(storage.isEmpty).toBe(false);
        expect(iterator).toBeDefined();

        let count = 0;
        while (iterator.moveNext()) {
            count += 1;
        }
        expect(count).toEqual(10);
    });
});
