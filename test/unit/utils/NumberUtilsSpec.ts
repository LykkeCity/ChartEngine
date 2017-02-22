/**
 * Tests for NumberUtils class
 */
import * as utils from '../../../src/lib/utils/index';

describe('NumberUtils tests', () => {

    it('Empty arguments', () => {
        expect(utils.NumberUtils.roundTo(null)).toBeNaN();
        expect(utils.NumberUtils.roundTo(undefined)).toBeNaN();
        expect(utils.NumberUtils.roundTo(NaN)).toBeNaN();

        expect(utils.NumberUtils.roundTo(1, null)).toBeNaN();
        expect(utils.NumberUtils.roundTo(1, NaN)).toBeNaN();
    });

    it('Default arguments', () => {
        expect(utils.NumberUtils.roundTo(1, undefined)).toEqual(1);
    });

    it('Round to 0 digits', () => {
        expect(utils.NumberUtils.roundTo(0, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.005, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.3, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.5, 0)).toEqual(1, '0.5 -> 1');
        expect(utils.NumberUtils.roundTo(0.7, 0)).toEqual(1);
        expect(utils.NumberUtils.roundTo(1, 0)).toEqual(1);
        expect(utils.NumberUtils.roundTo(1.1, 0)).toEqual(1);
        expect(utils.NumberUtils.roundTo(100.51, 0)).toEqual(101);
    });

    it('Round to 0 digits w/ negative numbers', () => {
        expect(utils.NumberUtils.roundTo(-0, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.005, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.3, 0)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.5, 0)).toEqual(0, '-0.5 -> 0');
        expect(utils.NumberUtils.roundTo(-0.7, 0)).toEqual(-1);
        expect(utils.NumberUtils.roundTo(-1, 0)).toEqual(-1);
        expect(utils.NumberUtils.roundTo(-1.1, 0)).toEqual(-1);
        expect(utils.NumberUtils.roundTo(-100.51, 0)).toEqual(-101);
    });

    it('Round to 1 digit', () => {
        expect(utils.NumberUtils.roundTo(0, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.005, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.015, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.055, 1)).toEqual(0.1);
        expect(utils.NumberUtils.roundTo(0.31, 1)).toEqual(0.3);
        expect(utils.NumberUtils.roundTo(0.35, 1)).toEqual(0.4);
        expect(utils.NumberUtils.roundTo(0.49, 1)).toEqual(0.5);
        expect(utils.NumberUtils.roundTo(0.5, 1)).toEqual(0.5);
        expect(utils.NumberUtils.roundTo(0.51, 1)).toEqual(0.5);
        expect(utils.NumberUtils.roundTo(0.7, 1)).toEqual(0.7);
        expect(utils.NumberUtils.roundTo(1, 1)).toEqual(1);
        expect(utils.NumberUtils.roundTo(1.1, 1)).toEqual(1.1);
        expect(utils.NumberUtils.roundTo(100.51, 1)).toEqual(100.5);
    });

    it('Round to 1 digit w/ negative numbers', () => {
        expect(utils.NumberUtils.roundTo(-0, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.005, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.015, 1)).toEqual(0);
        expect(utils.NumberUtils.roundTo(-0.055, 1)).toEqual(-0.1);
        expect(utils.NumberUtils.roundTo(-0.31, 1)).toEqual(-0.3);
        expect(utils.NumberUtils.roundTo(-0.35, 1)).toEqual(-0.3);
        expect(utils.NumberUtils.roundTo(-0.49, 1)).toEqual(-0.5);
        expect(utils.NumberUtils.roundTo(-0.5, 1)).toEqual(-0.5);
        expect(utils.NumberUtils.roundTo(-0.51, 1)).toEqual(-0.5);
        expect(utils.NumberUtils.roundTo(-0.7, 1)).toEqual(-0.7);
        expect(utils.NumberUtils.roundTo(-1, 1)).toEqual(-1);
        expect(utils.NumberUtils.roundTo(-1.1, 1)).toEqual(-1.1);
        expect(utils.NumberUtils.roundTo(-100.51, 1)).toEqual(-100.5);
    });

    it('Round to 2 digit', () => {
        expect(utils.NumberUtils.roundTo(0, 2)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.0001, 2)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.0005, 2)).toEqual(0);
        expect(utils.NumberUtils.roundTo(0.0099, 2)).toEqual(0.01);
        expect(utils.NumberUtils.roundTo(0.005, 2)).toEqual(0.01);
        expect(utils.NumberUtils.roundTo(0.015, 2)).toEqual(0.02);
        expect(utils.NumberUtils.roundTo(0.055, 2)).toEqual(0.06);
        expect(utils.NumberUtils.roundTo(0.31, 2)).toEqual(0.31);
        expect(utils.NumberUtils.roundTo(0.35, 2)).toEqual(0.35);
        expect(utils.NumberUtils.roundTo(0.5, 2)).toEqual(0.5);
        expect(utils.NumberUtils.roundTo(0.511, 2)).toEqual(0.51);
        expect(utils.NumberUtils.roundTo(0.799, 2)).toEqual(0.80);
        expect(utils.NumberUtils.roundTo(1, 2)).toEqual(1);
        expect(utils.NumberUtils.roundTo(1.1111, 2)).toEqual(1.11);
        expect(utils.NumberUtils.roundTo(100.511, 2)).toEqual(100.51);
    });
});
