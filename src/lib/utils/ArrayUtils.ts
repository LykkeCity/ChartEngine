/**
 * ArrayUtils class.
 */
import { IComparer } from './Interfaces';

/**
 * Utility methods for working with arrays.
 */
export class ArrayUtils {
    /**
     * Merges update array into target array using specified compararer.
     * Equal elements from update override elements from target.
     * Method expects target and update arrays to be in sorted order.
     * 
     * @returns New array containing elements from target and update arrays.
     */
    public static merge<T>(target: T[], update: T[], comparer: IComparer<T>) : T[] {

        const merged = new Array<T>(target.length + update.length); // preallocate memory

        let ia = 0;
        let ib = 0;
        let actualSize: number = 0;

        while (ia < target.length || ib < update.length) {
            if (ia < target.length && ib < update.length) {
                // compare dates
                if (comparer(target[ia], update[ib]) < 0) {
                    merged[actualSize] = target[ia];
                    ia += 1;
                } else if (comparer(target[ia], update[ib]) > 0) {
                    merged[actualSize] = update[ib];
                    ib += 1;
                } else {
                    // Take newest value
                    merged[actualSize] = update[ib];
                    ia += 1;
                    ib += 1;
                }
            } else if (ia < target.length) {
                // only A left
                merged[actualSize] = target[ia];
                ia += 1;
            } else if (ib < update.length) {
                // only B left
                merged[actualSize] = update[ib];
                ib += 1;
            }
            actualSize += 1;
        }
        merged.length = actualSize;
        return merged;
    }
}
