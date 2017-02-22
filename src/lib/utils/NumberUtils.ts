/**
 * NumberUtils class.
 * 
 * @class Utilities for numbers.
 */
export class NumberUtils {
     /**
     * Returns a number rounded to fractionDigits after point.
     * 
     * @param n number to round
     * @param fractionDigits how many digits after point.
     */
    public static roundTo(n: number, fractionDigits: number = 0) {
        if (typeof n === 'number' && typeof fractionDigits === 'number') {
            const num: any = (n + 'e+' + fractionDigits);
            return +(Math.round(num) + 'e-' + fractionDigits);
        }
        return NaN;
    }
}
