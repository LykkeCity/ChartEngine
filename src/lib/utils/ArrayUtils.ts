/**
 * 
 */
import { IComparer } from './Interfaces';

export class ArrayUtils {
    public static merge<T>(target: T[], update: T[], comparer: IComparer<T>) : T[] {

        let merged = new Array<T>(target.length + update.length); // preallocate memory

        let ia = 0;
        let ib = 0;
        let actualSize: number = 0;

        while (ia < target.length || ib < update.length) {
            if (ia < target.length && ib < update.length) {
                // compare dates
                if (comparer(target[ia], update[ib]) < 0) {
                    merged[actualSize] = target[ia];
                    ia++;
                } else if (comparer(target[ia], update[ib]) > 0) {
                    merged[actualSize] = update[ib];
                    ib++;
                } else {
                    // Take newest value
                    merged[actualSize] = update[ib];
                    ia++;
                    ib++;
                }
            } else if (ia < target.length) {
                // only A left
                merged[actualSize] = target[ia];
                ia++;
            } else if (ib < update.length) {
                // only B left
                merged[actualSize] = update[ib];
                ib++;
            }
            actualSize++;
        }
        merged.length = actualSize;
        return merged;
    }
}
