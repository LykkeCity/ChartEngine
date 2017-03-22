/**
 * 
 */
import { IDataIterator, IDataSnapshot } from './Interfaces';

export class ArrayIterator<T> implements IDataIterator<T> {

    private currentIndex = 0;

    constructor(
        private readonly dataSnapshot: IDataSnapshot<T>,
        private readonly timestamp: number,
        private readonly filter?: (item: T) => boolean
        ) {
            this.currentIndex = -1;
    }

    public reset(): void {
        this.currentIndex = -1;
    }

    public moveNext(): boolean {
        this.checkTimestamp();

        if (this.dataSnapshot.data.length === 0) {
            return false;
        }

        do {
            this.currentIndex += 1;
        }
        while (this.currentIndex < this.dataSnapshot.data.length
               && this.filter && !this.filter(this.dataSnapshot.data[this.currentIndex])); // If filter is defined use it.

        return (this.currentIndex < this.dataSnapshot.data.length);
    }

    public get current(): T {
        this.checkTimestamp();
        return this.dataSnapshot.data[this.currentIndex];
    }

    private checkTimestamp() : void {
        if (this.dataSnapshot.timestamp !== this.timestamp) {
            throw new Error('Data iterator is expired.');
        }
    }
}
