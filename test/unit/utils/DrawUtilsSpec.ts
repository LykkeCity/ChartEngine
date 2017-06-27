/**
 * Tests for DrawUtils class
 */
import * as utils from '../../../src/lib/utils/index';
import DrawUtils = utils.DrawUtils;

describe('DrawUtils tests', () => {

    it('Out of range checks', () => {

        const precision = 3;

        // ya = yb
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: -3, y: 0 }, { x: 3, y: 0 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 1 }, { x: -3, y: 1 }, { x: 3, y: 1 }, precision)).toEqual(true);

        // xa = xb
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 3 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: 0, y: -3 }, { x: 0, y: 3 }, precision)).toEqual(true);
    });

    it('Short lines', () => {

        const precision = 3;

        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0.1, y: 0.1 }, { x: 0, y: 0 }, { x: 0.2, y: 0.2 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, precision)).toEqual(true);

    });

    it('Negative results', () => {

        const precision = 0.5;

        // horizontal
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 6 , y: 2 }, { x: 1, y: 2 }, { x: 5, y: 2 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0 , y: 2 }, { x: 1, y: 2 }, { x: 5, y: 2 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 3 , y: 3 }, { x: 1, y: 2 }, { x: 5, y: 2 }, precision)).toEqual(false);

        expect(DrawUtils.IS_POINT_ON_LINE({ x: -6 , y: 2 }, { x: -1, y: 2 }, { x: -5, y: 2 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0 , y: 2 }, { x: -1, y: 2 }, { x: -5, y: 2 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: -3 , y: 3 }, { x: -1, y: 2 }, { x: -5, y: 2 }, precision)).toEqual(false);

        // vertical
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 0 }, { x: 1, y: 2 }, { x: 1, y: 5 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 6 }, { x: 1, y: 2 }, { x: 1, y: 5 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 2, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 5 }, precision)).toEqual(false);

        // diagonal
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 4, y: 1 }, { x: 1, y: 1 }, { x: 5, y: 5 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 4, y: 1 }, { x: -1, y: -1 }, { x: 5, y: 5 }, precision)).toEqual(false);

        expect(DrawUtils.IS_POINT_ON_LINE({ x: 7 , y: 7 }, { x: -5, y: -5 }, { x: 5, y: 5 }, precision)).toEqual(false);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: -7, y: 7 }, { x: -5, y: 5 }, { x: 5, y: -5 }, precision)).toEqual(false);

        expect(DrawUtils.IS_POINT_ON_LINE({ x: 3, y: 1 }, { x: -5, y: 5 }, { x: 5, y: -5 }, precision)).toEqual(false);
    });

    it('Positive results', () => {

        const precision = 1;

        // horizontal
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 3 , y: 2 }, { x: 1, y: 2 }, { x: 5, y: 2 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0 , y: 2 }, { x: -5, y: 2 }, { x: 5, y: 2 }, precision)).toEqual(true);

        // vertical
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 3 }, { x: 1, y: 2 }, { x: 1, y: 5 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: -3 }, { x: 1, y: -5 }, { x: 1, y: 5 }, precision)).toEqual(true);

        // diagonal
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 3, y: 3 }, { x: 1, y: 1 }, { x: 5, y: 5 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: -3 , y: -3 }, { x: -5, y: -5 }, { x: 5, y: 5 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: -5, y: -5 }, { x: 5, y: 5 }, precision)).toEqual(true);

        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: -5, y: 5 }, { x: 5, y: -5 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: -3, y: 3 }, { x: -5, y: 5 }, { x: 5, y: -5 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 3, y: -3 }, { x: -5, y: 5 }, { x: 5, y: -5 }, precision)).toEqual(true);
    });

    it('Precision check', () => {

        // precision = 1
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 5.1, y: 5 }, { x: 3, y: 3 }, { x: 6, y: 6 }, 1)).toEqual(true);

        // precision = 0.1
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 5.1, y: 5 }, { x: 3, y: 3 }, { x: 6, y: 6 }, 0.01)).toEqual(false);


        // Check two lines (short and long) with the same distance work the same with equal precision
        // Long line
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1000, y: 1000 }, 1)).toEqual(true);   // 0.001

        // Short line
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 5, y: 5 }, 1)).toEqual(true);         // 0.25
    });
});
