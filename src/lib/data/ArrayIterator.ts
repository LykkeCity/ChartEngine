/**
 * 
 */
import { IDataIterator, IDataSnapshot } from './Interfaces';

export class ArrayIterator<T> implements IDataIterator<T> {

    private currentIndex = 0;

    constructor(
        private dataSnapshot: IDataSnapshot<T>,
        private indexFirst: number,
        private indexLast: number,
        private timestamp: number) {
            this.currentIndex = -1;
    }

    public reset(): void {
        this.currentIndex = -1;
    }

    public moveNext(): boolean {
        this.checkTimestamp();
        if (this.currentIndex >= this.indexLast) {
            return false;
        } else if (this.currentIndex === -1 ) {
            this.currentIndex = this.indexFirst;
        } else {
            this.currentIndex += 1;
        }
        return true;
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
