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

    private readonly dataSnapshot: IDataSnapshot<T>;
    private readonly comparer: IComparer<T>;

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

    public get length(): number {
        return this.dataSnapshot.data.length;
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
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
        this.dataSnapshot.data = [];
    }

    public merge(update: T[], updateFunction?: (target: T, update: T) => T): void {
        if (update && update.length) {
            // Sort incoming array
            update.sort(this.comparer);
            // Update current timestamp
            this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
            // Import incoming data to the array
            this.dataSnapshot.data = ArrayUtils.merge(this.dataSnapshot.data, update, this.comparer, updateFunction);
        }
    }

    /**
     * Finds first element that matches the condition and removes all follwing items the element.
     * @param predicate
     */
    public removeAfterInclusive(predicate: (item: T) => boolean): void {

        let itemIndex = -1;
        this.dataSnapshot.data.some((e: T, i: number, array) => {
            if (predicate(e)) {
                itemIndex = i;
                return true;
            }
            return false;
        });

        if (itemIndex === -1) {
            //throw new Error('Element is not found.');
            return;
        }

        // Update current timestamp
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
        // Import incoming data to the array
        this.dataSnapshot.data.length = itemIndex;
        //this.dataSnapshot.data = this.dataSnapshot.data.slice(0, itemIndex + 1);
    }

    // public filter(filter?: (item: T) => boolean): IDataIterator<T> {
    //     return new ArrayIterator<T>(this.dataSnapshot, this.dataSnapshot.timestamp, filter);
    // }

    public getIterator(filter?: (item: T) => boolean): IDataIterator<T> {

        return new ArrayIterator(this.dataSnapshot, this.dataSnapshot.timestamp, filter);

        // // Find the element
        // const itemIndex = this.findIndex(predicate);

        // if (itemIndex !== -1) {
        //     const imin = Math.min(itemIndex, itemIndex + count);
        //     const imax = Math.max(itemIndex, itemIndex + count);
        //     return new ArrayIterator(this.dataSnapshot, this.dataSnapshot.timestamp,
        //                              (e: T, i: number) => { return (i >= imin && i <= imax); });
        // } else {
        //     return new ArrayIterator(
        //         this.dataSnapshot, this.dataSnapshot.timestamp, (e: T, i: number) => false); // Do not return anything               
        // }
    }

    // public contains(predicate: (item: T) => boolean): boolean {
    //     // Find the element
    //     const itemIndex = this.findIndex(predicate);

    //     return (itemIndex !== -1);
    // }

    // public containsCount(predicate: (item: T) => boolean, count: number): boolean {
    //     // Find the element
    //     const itemIndex = this.findIndex(predicate);

    //     return (itemIndex + count) >= 0 && (itemIndex + count) < this.dataSnapshot.data.length;
    // }

    // public findLast(predicate: (item: T) => boolean): T | undefined {
    //     let last: T | undefined;
    //     this.dataSnapshot.data.forEach((e: T, i: number) => {
    //         if (predicate(e)) {
    //             last = e;
    //         }
    //     });
    //     return last;
    // }

    // private findIndex(predicate: (item: T) => boolean): number {
    //     let itemIndex = -1;
    //     this.dataSnapshot.data.forEach((e: T, i: number) => {
    //         if (predicate(e)) {
    //             itemIndex = i;
    //         }
    //     });
    //     return itemIndex;
    // }
}
