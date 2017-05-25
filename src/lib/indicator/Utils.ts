/**
 * Utility functions
 */
import { Candlestick } from '../model/index';
import { FixedSizeArray } from '../shared/index';

export class Utils {
    /**
     * Standard deviation
     * @param array
     * @param average
     */
    public static STDDEV(array: FixedSizeArray<Candlestick>, accessor: (c: Candlestick) => number|undefined, average: number): number|undefined {
        let sum = 0;
        for (let i = 0; i < array.length; i += 1) {
            const value = accessor(array.getItem(i));
            if (value !== undefined) {
                sum += Math.pow(value - average, 2);
            }
        }
        return array.length > 0 ? Math.sqrt(sum / array.length) : undefined;
    }

    // MAD = SUM(|Pi - m|) / N
    /**
     * Mean absolute deviation
     * @param N Number of items to take
     * @param array Source items
     * @param accessor Accessor for a item's value
     * @param mean Mean value
     */
    public static MAD(N: number, array: FixedSizeArray<Candlestick>, accessor: (c: Candlestick) => number|undefined, mean: number): number|undefined {
        let sum = 0;
        let counter = 0;
        // Taking N items from end
        for (let i = array.length - 1; i >= 0 && counter < N; i -= 1) {
            const value = accessor(array.getItem(i));
            if (value !== undefined) {
                sum += Math.abs(value - mean);
            }
            counter += 1;
        }

        return counter > 0 ? sum / counter : undefined;
    }

    // /**
    //  * Standard deviation
    //  * @param array 
    //  * @param average 
    //  */
    // public static STDDEVN(array: number,) {
    //     let sum = 0;
    //     for (let i = 0; i < array.length; i += 1) {
    //         const value = accessor(array.getItem(i));
    //         if (value !== undefined) {
    //             sum += Math.pow(value - average, 2);
    //         }
    //     }
    //     return array.length > 0 ? Math.sqrt(sum / array.length) : 0;
    // }    
}
