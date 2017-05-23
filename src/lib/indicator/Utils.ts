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
    public static STDDEV(array: FixedSizeArray<Candlestick>, accessor: (c: Candlestick) => number|undefined, average: number) {
        let sum = 0;
        for (let i = 0; i < array.length; i += 1) {
            const value = accessor(array.getItem(i));
            if (value !== undefined) {
                sum += Math.pow(value - average, 2);
            }
        }
        return array.length > 0 ? Math.sqrt(sum / array.length) : 0;
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
