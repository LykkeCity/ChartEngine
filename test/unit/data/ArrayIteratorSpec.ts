/**
 * ArrayIterator tests.
 */
import * as core from '../../../src/lib/core/index';
import * as data from '../../../src/lib/data/index';

describe('ArrayIterator tests', () => {

    const snapshot = { timestamp: 0, data: [] };

    beforeEach(() => {
        snapshot.data = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    });

    it('Empty storage', () => {
        const emptySnapshot = { timestamp: 0, data: [] };
        const iterator = new data.ArrayIterator<number>(emptySnapshot, emptySnapshot.timestamp);

        expect(iterator.count()).toEqual(0);
        expect(iterator.moveNext()).toEqual(false);
        expect(iterator.movePrev()).toEqual(false);
    });

    it('Operations with not filtered iterator. Count.', () => {
        const iterator = new data.ArrayIterator<number>(snapshot, snapshot.timestamp);
        expect(iterator.count()).toEqual(snapshot.data.length);
    });

    it('Operations with not filtered iterator. MoveNext.', () => {
        const iterator = new data.ArrayIterator<number>(snapshot, snapshot.timestamp);

        snapshot.data.forEach(element => {
            expect(iterator.moveNext()).toEqual(true);
            expect(iterator.current).toEqual(element);
        });

        expect(iterator.moveNext()).toEqual(false);
    });

    it('Operations with not filtered iterator. MovePrev.', () => {
        const iterator = new data.ArrayIterator<number>(snapshot, snapshot.timestamp);
        expect(iterator.goTo(e => e === 9)).toEqual(true);
        snapshot.data.forEach(element => {
            if (element < 9) {
                expect(iterator.movePrev()).toEqual(true);
                expect(iterator.current).toEqual(snapshot.data.length - (element + 2));
            }
        });
        expect(iterator.movePrev()).toEqual(false);
    });

    it('Operations with not filtered iterator. Find.', () => {
        const iterator = new data.ArrayIterator<number>(snapshot, snapshot.timestamp);
        expect(iterator.find(e => e === 0)).toEqual(0);
        expect(iterator.find(e => e === 3)).toEqual(3);
        expect(iterator.find(e => e === 9)).toEqual(9);
        expect(iterator.find(e => e === 10)).toBeUndefined();
    });

    it('Operations with not filtered iterator. GoTo.', () => {
        const iterator = new data.ArrayIterator<number>(snapshot, snapshot.timestamp);
        expect(iterator.goTo(e => e === 0)).toEqual(true);
        expect(iterator.current).toEqual(0);
        expect(iterator.goTo(e => e === 3)).toEqual(true);
        expect(iterator.current).toEqual(3);
        expect(iterator.goTo(e => e === 9)).toEqual(true);
        expect(iterator.current).toEqual(9);
        expect(iterator.goTo(e => e === 10)).toEqual(false);
    });
});
