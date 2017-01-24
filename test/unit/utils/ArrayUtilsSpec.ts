/**
 * 
 */
import * as utils from '../../../src/lib/utils/index';

class Point {
    constructor(
        public date: Date,
        public x: number,
        public y: number
    ) { }
}

describe('ArrayUtils tests', () => {

    const customMatchers = {
        toNotContainUndefined: (util, customEqualityTesters) => {
            return {
                compare: (actual, expected) => {
                    if (expected === undefined) {
                        expected = '';
                    }
                    const result = { pass: true, message: '' };

                    if (!actual.length) {
                        throw new Error('Expected array');
                    }

                    for (const value of actual) {
                        if (value === undefined) {
                            result.pass = false;
                            break;
                        }
                    }

                    if (result.pass) {
                        result.message = 'Expected undefined';
                    } else {
                        result.message = 'Array contains undefined.';
                    }
                    return result;
                }
            };
        }
    };

    beforeEach(() => {
        jasmine.addMatchers(customMatchers);
    });

    // afterEach(() => {
    // });

    it('Empty merge', () => {
        const array1 = [];
        const array2 = [];
        const res = utils.ArrayUtils.merge(array1, array2, (n1, n2) => n1 - n2);
        expect(res.length).toEqual(0);
    });

    it('Basic merge', () => {
        const array1 = [1, 2, 3];
        const array2 = [1.5, 2.5];
        const res = utils.ArrayUtils.merge(array1, array2, (n1, n2) => n1 - n2);

        expect(res.length).toEqual(5);
        expect(res[0]).toEqual(1);
        expect(res[1]).toEqual(1.5);
    });

    it('Basic object merge', () => {
        const array1 = [
            new Point(new Date(2017, 0, 1), 1.0, 2.0),
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 5), 1.0, 2.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(5);
        expect(res).toNotContainUndefined();
    });

    it('Object merge with overlapping end.', () => {
        const array1 = [
            new Point(new Date(2017, 0, 1), 1.0, 2.0),
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 3), 2.0, 3.0),
            new Point(new Date(2017, 0, 4), 2.0, 3.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(4);
        expect(res).toNotContainUndefined();
        expect({ x: res[2].x, y: res[2].y}).toEqual({ x: 2.0, y: 3.0 });
        expect({ x: res[3].x, y: res[3].y}).toEqual({ x: 2.0, y: 3.0 });
    });

    it('Object merge with overlapping beginning.', () => {
        const array1 = [
            new Point(new Date(2017, 0, 1), 1.0, 2.0),
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 1), 2.0, 3.0),
            new Point(new Date(2017, 0, 2), 3.0, 4.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(4);
        expect(res).toNotContainUndefined();
        expect({ x: res[0].x, y: res[0].y}).toEqual({ x: 2.0, y: 3.0 });
        expect({ x: res[1].x, y: res[1].y}).toEqual({ x: 3.0, y: 4.0 });
    });

    it('Object merge with overlapping middle.', () => {
        const array1 = [
            new Point(new Date(2017, 0, 1), 1.0, 2.0),
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 2), 2.0, 3.0),
            new Point(new Date(2017, 0, 3), 3.0, 4.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(4);
        expect(res).toNotContainUndefined();
        expect({ x: res[1].x, y: res[1].y}).toEqual({ x: 2.0, y: 3.0 });
        expect({ x: res[2].x, y: res[2].y}).toEqual({ x: 3.0, y: 4.0 });
    });

    it('Object merge. Insert new to beginning.', () => {
        const array1 = [
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0),
            new Point(new Date(2017, 0, 5), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 1), 2.0, 3.0),
            new Point(new Date(2017, 0, 2), 3.0, 4.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(5);
        expect(res).toNotContainUndefined();
        expect({ x: res[0].x, y: res[0].y}).toEqual({ x: 2.0, y: 3.0 });
        expect({ x: res[1].x, y: res[1].y}).toEqual({ x: 3.0, y: 4.0 });
    });

    it('Object merge. Add new to the end.', () => {
        const array1 = [
            new Point(new Date(2017, 0, 2), 1.0, 2.0),
            new Point(new Date(2017, 0, 3), 1.0, 2.0),
            new Point(new Date(2017, 0, 4), 1.0, 2.0),
            new Point(new Date(2017, 0, 5), 1.0, 2.0)
        ];
        const array2 = [
            new Point(new Date(2017, 0, 5), 2.0, 3.0),
            new Point(new Date(2017, 0, 6), 3.0, 4.0)
        ];

        const res = utils.ArrayUtils.merge(array1, array2, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });

        expect(res.length).toEqual(5);
        expect(res).toNotContainUndefined();
        expect({ x: res[3].x, y: res[3].y}).toEqual({ x: 2.0, y: 3.0 });
        expect({ x: res[4].x, y: res[4].y}).toEqual({ x: 3.0, y: 4.0 });
    });
});
