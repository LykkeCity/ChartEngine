/**
 * ArrayDataStorage class.
 */
import { ArrayUtils, IComparer } from '../utils/index';
import { ArrayIterator } from './ArrayIterator';
import { IDataIterator, IDataSnapshot, IDataStorage } from './Interfaces';

export class ArrayDataStorage<T> implements IDataStorage<T> {

    private dataSnapshot: IDataSnapshot<T>;

    constructor(initArray?: T[]) {
        this.dataSnapshot = {
            data: initArray ? initArray.slice() : [],
            timestamp: 0
        };
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

    public merge(update: T[], comparer: IComparer<T>): void {
        // Update current timestamp
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
        // Import incoming data to the array
        this.dataSnapshot.data = ArrayUtils.merge(this.dataSnapshot.data, update, comparer);
    }

    public getIterator(filter?: (item: T) => boolean): IDataIterator<T> {
        return new ArrayIterator<T>(this.dataSnapshot, this.dataSnapshot.timestamp, filter);
    }
}
