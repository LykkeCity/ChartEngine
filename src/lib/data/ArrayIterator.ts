/**
 * ArrayIterator class
 */
import { IDataIterator, IDataSnapshot } from './Interfaces';

export class ArrayIterator<T> implements IDataIterator<T> {

    private currentIndex = 0;
    private readonly filter?: (item: T) => boolean;

    constructor(
        private readonly dataSnapshot: IDataSnapshot<T>,
        private timestamp: number,
        filter?: (item: T) => boolean
        ) {
            this.currentIndex = -1;
            this.filter = filter;
    }

    public reset(): void {
        this.currentIndex = -1;
        this.timestamp = this.dataSnapshot.timestamp;
    }

    /**
     * Starts from the beginning of data.
     * If item is found returns true, if not - false.
     */
    public goTo(predicate: (item: T) => boolean): boolean {
        this.reset();

        while (this.moveNext()) {
            if (predicate(this.current)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Moves iterator while condition is met. Stays on the last element that satisfies condition.
     * Starts from the beginning.
     * @param predicate 
     */
    public goWhile(predicate: (item: T) => boolean): boolean {
        if (this.filter) { throw new Error('Not implemented.'); }

        this.reset();

        let nextIndex = 0;
        while (nextIndex < this.dataSnapshot.data.length
               && predicate(this.dataSnapshot.data[nextIndex])) {

            this.currentIndex = nextIndex;
            nextIndex += 1;
        }

        return (this.currentIndex >= 0 && this.currentIndex < this.dataSnapshot.data.length);
    }

    /**
     * Moves pointer from current position untill condition is met.
     * Returns count of moves done. Or -1 if could not find element.
     */
    public moveTo(predicate: (item: T) => boolean): number {
        let countMoves = 0;

        // First check current element:
        do {
            if (predicate(this.current)) {
                return countMoves;
            }
            countMoves += 1;
        } while (this.moveNext());

        return -1;
    }

    public getCount(): number {
        this.checkTimestamp();

        if (this.filter) { throw new Error('Not implemented.'); }

        return this.dataSnapshot.data.length;
    }

    private skipFilteredForward(index: number): number {

        if (this.filter) {
            do {
                index += 1;
            }
            while (index < this.dataSnapshot.data.length && !this.filter(this.dataSnapshot.data[index]));
        } else {
            index += 1;
        }

        return index;
    }

    private skipFilteredBackward(index: number): number {
        if (this.filter) {
            do {
                index -= 1;
            }
            while (index >= 0 && !this.filter(this.dataSnapshot.data[index]));
        } else {
            index -= 1;
        }

        return index;
    }

    /**
     * Moves pointer forward n times.
     * Returns actual count of moves done.
     */
    public moveNextTimes(n: number): number {
        let i = 0;
        while (i < n && this.moveNext()) { i += 1; }
        return i; //(i === n);
    }

    /**
     * Moves pointer forward/backward n times.
     * Returns actual count of moves done (positive or negative).
     * Current can not become undefined.
     */
    public moveTimes(n: number): number {
        this.checkTimestamp();

        if (this.dataSnapshot.data.length === 0 || n === 0) {
            return 0;
        }

        if (this.filter) { throw new Error('Not implemented.'); }

        let shift;
        if (n < 0) {
            shift = Math.max(-this.currentIndex, n);
        } else {
            shift = Math.min( this.dataSnapshot.data.length - ( this.currentIndex + 1), n );
        }

        this.currentIndex += shift;
        return shift;
    }

    /**
     * Moves pointer on 1 item forward.
     * Returns false if can not move.
     */
    public moveNext(): boolean {
        this.checkTimestamp();

        if (this.dataSnapshot.data.length === 0) {
            return false;
        }

        // Current index must not get greater then length
        if (this.currentIndex === this.dataSnapshot.data.length) {
            return false;
        }

        do {
            this.currentIndex += 1;
        }
        while (this.currentIndex < this.dataSnapshot.data.length
            && this.filter && !this.filter(this.dataSnapshot.data[this.currentIndex])); // If filter is defined use it.

        return (this.currentIndex < this.dataSnapshot.data.length);
    }

    /**
     * Moves pointer on 1 item backwards.
     * Returns false if can not move.
     */
    public movePrev(): boolean {
        this.checkTimestamp();

        if (this.dataSnapshot.data.length === 0) {
            return false;
        }

        // Current index must not get less then -1
        if (this.currentIndex === -1) {
            return false;
        }

        // Using filter to skip some elements
        do {
            this.currentIndex -= 1;
        }
        while (this.currentIndex >= 0
            && this.filter && !this.filter(this.dataSnapshot.data[this.currentIndex])); // If filter is defined use it.

        return (this.currentIndex >= 0 && this.currentIndex < this.dataSnapshot.data.length);
    }

    /**
     * Iterates backwards starting from the current position.
     * Iterats till @func returns "true" and begginning of storage is not reached.
     * Counter: [
     *   0 - current element,
     *   1 - previous element,
     *   ...
     * ]
     * @param func 
     */
    public movePrevWhile(func: (item: T, counter: number) => boolean) {
        this.checkTimestamp();

        if (this.currentIndex < 0 || this.currentIndex >= this.dataSnapshot.data.length) {
            return;
        }

        let counter = 0;
        do {
            if (!func(this.current, counter)) {
                break;
            }
            counter += 1;
        } while (this.movePrev());
    }

    public get current(): T {
        this.checkTimestamp();
        return this.dataSnapshot.data[this.currentIndex];
    }

    public goToLast(): boolean {
        if (this.filter) { throw new Error('Not implemented.'); }

        this.reset();

        if (this.dataSnapshot.data.length > 0) {
            this.currentIndex = this.dataSnapshot.data.length - 1;
            return true;
        }
        return false;
    }

    public get first(): T|undefined {
        if (this.filter) { throw new Error('Not implemented.'); }

        this.checkTimestamp();
        if (this.dataSnapshot.data.length > 0) {
            return this.dataSnapshot.data[0];
        }
    }

    public get last(): T|undefined {
        if (this.filter) { throw new Error('Not implemented.'); }

        this.checkTimestamp();
        if (this.dataSnapshot.data.length > 0) {
            return this.dataSnapshot.data[this.dataSnapshot.data.length - 1];
        }
    }

    public get previous(): T|undefined {
        if (this.filter) { throw new Error('Not implemented.'); }

        this.checkTimestamp();
        if (this.currentIndex >= 1) {
            return this.dataSnapshot.data[this.currentIndex - 1];
        }
    }

    private checkTimestamp() : void {
        if (this.dataSnapshot.timestamp !== this.timestamp) {
            // ignore
        }
    }
}
