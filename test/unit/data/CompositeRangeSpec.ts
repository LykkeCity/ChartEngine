/**
 * CompositeRange tests.
 */
import * as core from '../../../src/lib/core/index';
import * as data from '../../../src/lib/data/index';

describe('CompositeRange tests', () => {

    const snapshot = { timestamp: 0, data: [] };

    beforeEach(() => {
        snapshot.data = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
    });

    it('Empty range', () => {
        const start = new Date(2017, 0, 1);
        const end = new Date(2017, 0, 2);
        const cr = new data.CompositeRange();
        const res = cr.diff({start: start, end: end});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(start);
        expect(res[0].end).toEqual(end);
    });

    it('One segment', () => {
        const d1 = new Date(2017, 0, 1);
        const d2 = new Date(2017, 0, 2);
        const d3 = new Date(2017, 0, 3);
        const d4 = new Date(2017, 0, 4);
        const d5 = new Date(2017, 0, 5);
        const d6 = new Date(2017, 0, 6);
        const d7 = new Date(2017, 0, 7);
        const cr = new data.CompositeRange();
        cr.append({ start: d3, end: d5 });

        // -----------|-----|----------
        // --*---*---------------------
        let res = cr.diff({start: d1, end: d2});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d1);
        expect(res[0].end).toEqual(d2);

        // -----------|-----|----------
        // ------*-------*-------------
        res = cr.diff({start: d1, end: d4});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d1);
        expect(res[0].end).toEqual(d3);

        // -----------|-----|----------
        // -------------*-*-------------
        res = cr.diff({start: d4, end: d4});
        expect(res).toBeDefined();
        expect(res.length).toEqual(0);

        // -----------|-----|----------
        // --------------*------*------
        res = cr.diff({start: d4, end: d6});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d5);
        expect(res[0].end).toEqual(d6);

        // -----------|-----|----------
        // ---------------------*---*--
        res = cr.diff({start: d6, end: d7});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d6);
        expect(res[0].end).toEqual(d7);

        // -----------|-----|----------
        // -------*-------------*------
        res = cr.diff({start: d1, end: d7});
        expect(res).toBeDefined();
        expect(res.length).toEqual(2);
        expect(res[0].start).toEqual(d1);
        expect(res[0].end).toEqual(d3);
        expect(res[1].start).toEqual(d5);
        expect(res[1].end).toEqual(d7);

    });

    it('Two segments', () => {
        const d1 = new Date(2017, 0, 1);
        const d2 = new Date(2017, 0, 2);
        const d3 = new Date(2017, 0, 3);
        const d4 = new Date(2017, 0, 4);
        const d5 = new Date(2017, 0, 5);
        const d6 = new Date(2017, 0, 6);
        const d7 = new Date(2017, 0, 7);
        const d8 = new Date(2017, 0, 8);
        const d9 = new Date(2017, 0, 9);
        const d10 = new Date(2017, 0, 10);
        const d11 = new Date(2017, 0, 11);
        const d12 = new Date(2017, 0, 12);
        const cr = new data.CompositeRange();
        cr.append({ start: d3, end: d5 });
        cr.append({ start: d8, end: d10 });

        // -----------|-----|--------|-----|--------
        // --------------*-----*--------------------
        let res = cr.diff({start: d4, end: d6});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d5);
        expect(res[0].end).toEqual(d6);

        // -----------|-----|--------|-----|--------
        // --------------------*--------*-----------
        res = cr.diff({start: d6, end: d9});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d6);
        expect(res[0].end).toEqual(d8);

        // -----------|-----|--------|-----|--------
        // --------------------*--*-----------------
        res = cr.diff({start: d6, end: d7});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d6);
        expect(res[0].end).toEqual(d7);
    });

    it('Append segment', () => {
        const d1 = new Date(2017, 0, 1);
        const d2 = new Date(2017, 0, 2);
        const d3 = new Date(2017, 0, 3);
        const d4 = new Date(2017, 0, 4);
        const d5 = new Date(2017, 0, 5);
        const d6 = new Date(2017, 0, 6);
        const d7 = new Date(2017, 0, 7);
        const d8 = new Date(2017, 0, 8);
        const d9 = new Date(2017, 0, 9);
        const d10 = new Date(2017, 0, 10);
        const d11 = new Date(2017, 0, 11);
        const d12 = new Date(2017, 0, 12);
        const cr = new data.CompositeRange();
        cr.append({ start: d3, end: d5 });
        cr.append({ start: d8, end: d10 });
        cr.append({ start: d4, end: d9 });  // Unite all ranges

        // -----------|-----^--------^-----|--------
        // --------------------*--*-----------------
        let res = cr.diff({start: d6, end: d7});
        expect(res).toBeDefined();
        expect(res.length).toEqual(0);

        // -----------|-----^--------^-----|--------
        // -------*----------------------------*----
        res = cr.diff({start: d2, end: d11});
        expect(res).toBeDefined();
        expect(res.length).toEqual(2);
        expect(res[0].start).toEqual(d2);
        expect(res[0].end).toEqual(d3);
        expect(res[1].start).toEqual(d10);
        expect(res[1].end).toEqual(d11);

        // -----------|-----^--------^-----|--------
        // ----------------------------------*--*---
        res = cr.diff({start: d11, end: d12});
        expect(res).toBeDefined();
        expect(res.length).toEqual(1);
        expect(res[0].start).toEqual(d11);
        expect(res[0].end).toEqual(d12);
    });
});
