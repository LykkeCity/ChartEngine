/**
 * Tests for DrawUtils class
 */
import * as utils from '../../../src/lib/utils/index';
import DrawUtils = utils.DrawUtils;

describe('DrawUtils tests', () => {

    /*
    * IS_POINT_ON_LINE method tests
    */

    it('IS_POINT_ON_LINE. Out of range checks', () => {

        const precision = 3;

        // ya = yb
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 2, y: 1 }, { x: 1, y: 1 }, { x: 3, y: 1 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: -3, y: 0 }, { x: 3, y: 0 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 1 }, { x: -3, y: 1 }, { x: 3, y: 1 }, precision)).toEqual(true);

        // xa = xb
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 2 }, { x: 1, y: 1 }, { x: 1, y: 3 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: 0, y: -3 }, { x: 0, y: 3 }, precision)).toEqual(true);
    });

    it('IS_POINT_ON_LINE. Short lines', () => {

        const precision = 3;

        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 0.1, y: 0.1 }, { x: 0, y: 0 }, { x: 0.2, y: 0.2 }, precision)).toEqual(true);
        expect(DrawUtils.IS_POINT_ON_LINE({ x: 1, y: 1 }, { x: 0, y: 0 }, { x: 1, y: 1 }, precision)).toEqual(true);
    });

    it('IS_POINT_ON_LINE. Negative results', () => {

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

    it('IS_POINT_ON_LINE. Positive results', () => {

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

    it('IS_POINT_ON_LINE. Precision check', () => {

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

    /*
    * DIST method tests
    */

    it('DIST method test', () => {
        expect(DrawUtils.DIST({ x: 1, y: 1 }, { x: 4, y: 5 })).toEqual(5);
        expect(DrawUtils.DIST({ x: -1, y: 1 }, { x: -4, y: 5 })).toEqual(5);
        expect(DrawUtils.DIST({ x: -1, y: -1 }, { x: -4, y: -5 })).toEqual(5);
        expect(DrawUtils.DIST({ x: 1, y: -1 }, { x: 4, y: -5 })).toEqual(5);

        expect(DrawUtils.DIST({ x: 1, y: 0 }, { x: 5, y: 0 })).toEqual(4);
        expect(DrawUtils.DIST({ x: -1, y: 0 }, { x: -5, y: 0 })).toEqual(4);
        expect(DrawUtils.DIST({ x: 0, y: 1 }, { x: 0, y: 5 })).toEqual(4);
        expect(DrawUtils.DIST({ x: 0, y: -1 }, { x: 0, y: -5 })).toEqual(4);

        expect(DrawUtils.DIST({ x: -1, y: -2 }, { x: 3, y: 1 })).toEqual(5);
        expect(DrawUtils.DIST({ x: -1, y: 2 }, { x: 3, y: -1 })).toEqual(5);
    });

    /*
    * DIST_TO_LINE method tests
    */

    it('DIST_TO_LINE method tests', () => {
        let dist = DrawUtils.DIST_TO_LINE({ x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1});
        expect(round(dist, 5)).toEqual(1.41421);

        dist = DrawUtils.DIST_TO_LINE({ x: -1, y: -1 }, { x: -1, y: 1 }, { x: 1, y: -1});
        expect(round(dist, 5)).toEqual(1.41421);

        dist = DrawUtils.DIST_TO_LINE({ x: 0, y: 6 }, { x: -1, y: 5 }, { x: 1, y: 5});
        expect(dist).toEqual(1);

        dist = DrawUtils.DIST_TO_LINE({ x: 0, y: 6 }, { x: -1, y: 0 }, { x: 1, y: 0});
        expect(dist).toEqual(6);

        dist = DrawUtils.DIST_TO_LINE({ x: -6, y: 0 }, { x: 0, y: 5 }, { x: 0, y: -5});
        expect(dist).toEqual(6);
    });

    it('MID method tests', () => {
        let mid = DrawUtils.MID({ x: -1, y: -1 }, { x: 1, y: 1});
        expect(mid.x).toEqual(0);
        expect(mid.y).toEqual(0);

        mid = DrawUtils.MID({ x: 1, y: 1 }, { x: 6, y: 6});
        expect(mid.x).toEqual(3.5);
        expect(mid.y).toEqual(3.5);
    });

    it('ANGLE method tests', () => {
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: 1, y: 0}))).toEqual(0);
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: 1, y: 1}))).toEqual(45);
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: 0, y: 1}))).toEqual(90);
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: -1, y: 0}))).toEqual(180);

        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: 1, y: -1}))).toEqual(-45);
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: 0, y: -1}))).toEqual(-90);
        expect(radian2Deg(DrawUtils.ANGLE({ x: 0, y: 0 }, { x: -1, y: -1}))).toEqual(-135);
    });

    it('EXTEND method tests', () => {
        // frame's height is less than its width
        //
        let ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 15, y: 13}, { x: 10, y: 10, w: 100, h: 50 });
        expect(ext.x).toEqual(15);
        expect(ext.y).toEqual(10);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 15, y: 18}, { x: 10, y: 10, w: 100, h: 50 });
        expect(ext.x).toEqual(15);
        expect(ext.y).toEqual(60);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 13, y: 15}, { x: 10, y: 10, w: 100, h: 50 });
        expect(ext.x).toEqual(10);
        expect(ext.y).toEqual(15);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 18, y: 15}, { x: 10, y: 10, w: 100, h: 50 });
        expect(ext.x).toEqual(110);
        expect(ext.y).toEqual(15);

        // frame's height is greater than its width
        //
        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 15, y: 13}, { x: 10, y: 10, w: 50, h: 100 });
        expect(ext.x).toEqual(15);
        expect(ext.y).toEqual(10);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 15, y: 18}, { x: 10, y: 10, w: 50, h: 100 });
        expect(ext.x).toEqual(15);
        expect(ext.y).toEqual(110);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 13, y: 15}, { x: 10, y: 10, w: 50, h: 100 });
        expect(ext.x).toEqual(10);
        expect(ext.y).toEqual(15);

        ext = DrawUtils.EXTEND({ x: 15, y: 15 }, { x: 18, y: 15}, { x: 10, y: 10, w: 50, h: 100 });
        expect(ext.x).toEqual(60);
        expect(ext.y).toEqual(15);
    });

    it('LINEAR method tests', () => {
        // horizontal lines
        expect(DrawUtils.LINEAR({ x: 1, y: 0 }, { x: 2, y: 0}, 3)).toEqual(0);
        expect(DrawUtils.LINEAR({ x: -1, y: 0 }, { x: -2, y: 0}, -3)).toEqual(-0);
        // vertical lines
        expect(DrawUtils.LINEAR({ x: 0, y: 1 }, { x: 0, y: 2}, 3)).toBeUndefined();
        expect(DrawUtils.LINEAR({ x: 0, y: -1 }, { x: 0, y: -2}, -3)).toBeUndefined();

        expect(DrawUtils.LINEAR({ x: 1, y: 1 }, { x: 2, y: 2}, 3)).toEqual(3);
        expect(DrawUtils.LINEAR({ x: 1, y: 1 }, { x: 2, y: 2}, 0)).toEqual(0);

        expect(DrawUtils.LINEAR({ x: -1, y: 1 }, { x: 2, y: -2}, 3)).toEqual(-3);
        expect(DrawUtils.LINEAR({ x: -1, y: 1 }, { x: 2, y: -2}, 0)).toEqual(0);
    });

    it('SOLVE_QUAD method tests', () => {
        let res = DrawUtils.SOLVE_QUAD(1, 0, 0);
        expect(res).toEqual([-0]);

        res = DrawUtils.SOLVE_QUAD(0, 1, 0);
        expect(res).toEqual([-0]);

        res = DrawUtils.SOLVE_QUAD(0, 0, 1);
        expect(res.length).toEqual(0);

        res = DrawUtils.SOLVE_QUAD(0, 1, 1);
        expect(res).toEqual([-1]);

        res = DrawUtils.SOLVE_QUAD(1, 0, -1);
        expect(res).toEqual([1, -1]);

        res = DrawUtils.SOLVE_QUAD(1, 1, 0);
        expect(res).toEqual([0, -1]);

        res = DrawUtils.SOLVE_QUAD(1, 1, -2);
        expect(res).toEqual([1, -2]);
    });
});

function round(value: number, digits: number): number {
    const k = Math.pow(10, digits);
    return Math.floor(value * k) / k;
}

function radian2Deg(angleRad: number): number {
    return angleRad * 180 / Math.PI;
}
