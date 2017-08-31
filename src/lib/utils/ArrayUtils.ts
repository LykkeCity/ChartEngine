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
    public static MERGE<T>(target: T[], update: T[], comparer: IComparer<T>, updateFunction?: (target: T, update: T) => T) : T[] {

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
                    if (updateFunction) {
                        merged[actualSize] = updateFunction(target[ia], update[ib]);
                    } else {
                        merged[actualSize] = update[ib];
                    }
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

    /**
     * Shifts element with specified index by the specified value.
     * If "index + shift" is out of array range, than element is just shifted to the start or the end of array.
     * The size of array is not changed.
     * @param array Containing array.
     * @param index Index of the element to shift.
     * @param shift Positive or negative value that specifies shift value. 
     */
    public static SHIFT<T>(array: T[], index: number, shift: number): void {
        if (array && array.length && shift !== 0) {
            if (index < 0 || index >= array.length) {
                throw new Error('Specified index is out of range.');
            }

            const step = shift > 0 ? 1 : -1;
            const fin = Math.min(Math.max(index + shift, 0), array.length - 1);
            for (let i = index; i !== fin; i += step) {
                const t = array[i];
                array[i] = array[i + step];
                array[i + step] = t;
            }
        }
    }
}
