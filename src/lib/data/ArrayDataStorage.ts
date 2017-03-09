/**
 * ArrayDataStorage class.
 */
import { ArrayUtils, IComparer } from '../utils/index';
import { ArrayIterator } from './ArrayIterator';
import { IDataIterator, IDataSnapshot, IDataStorage } from './Interfaces';

/**
 * Stores items in sorted array.
 */
export class ArrayDataStorage<T> implements IDataStorage<T> {

    private dataSnapshot: IDataSnapshot<T>;
    private comparer: IComparer<T>;

    constructor(comparer: IComparer<T>, initArray?: T[]) {
        if (!comparer) {
            throw new Error('Argument \'comparer\' is null.');
        }
        this.comparer = comparer;
        this.dataSnapshot = {
            data: initArray ? initArray.slice() : [],
            timestamp: 0
        };
        // sort initial array
        this.dataSnapshot.data.sort(this.comparer);
    }

    public get first(): T | undefined {
        const data = this.dataSnapshot.data;
        return (data.length > 0) ? data[0] : undefined;
    }

    public get last(): T | undefined {
        const data = this.dataSnapshot.data;
        const length = data.length;
        return (length > 0) ? data[length - 1] : undefined;
    }

    public get isEmpty(): boolean {
        return this.dataSnapshot.data.length === 0;
    }

    public clear() : void {
        this.dataSnapshot.data = [];
    }

    public merge(update: T[]): void {
        if (update && update.length) {
            // Sort incoming array
            update.sort(this.comparer);
            // Update current timestamp
            this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
            // Import incoming data to the array
            this.dataSnapshot.data = ArrayUtils.merge(this.dataSnapshot.data, update, this.comparer);
        }
    }

    public getIterator(filter?: (item: T) => boolean): IDataIterator<T> {
        return new ArrayIterator<T>(this.dataSnapshot, this.dataSnapshot.timestamp, filter);
    }
}
