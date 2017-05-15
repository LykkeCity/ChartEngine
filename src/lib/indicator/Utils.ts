/**
 * Utility functions
 */
import { FixedSizeArray } from '../shared/index';

export class Utils {
    /**
     * Standard deviation
     * @param array 
     * @param average 
     */
    public static STDDEV(array: FixedSizeArray<number>, average: number) {
        let sum = 0;
        for (let i = 0; i < array.length; i += 1) {
            sum += Math.pow(array.getItem(i) - average, 2);
        }
        return array.length > 0 ? Math.sqrt(sum / array.length) : 0;
    }
}
