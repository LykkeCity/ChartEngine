/**
 * CandlestickIterator class
 */
import { TimeInterval } from '../core/index';
import { Candlestick, Uid } from '../model/index';
import { DateUtils } from '../utils/index';
import { IBasicIterator, IDataIterator, IDataSource } from './Interfaces';

class ExtendedTimeLineIterator implements IBasicIterator<Uid> {

    private data: IDataIterator<Candlestick>;
    private start: Uid;
    private interval: TimeInterval;
    private cur: Uid|undefined;
    private first: Uid|undefined;
    private last: Uid|undefined;
    private outOfRange: boolean;

    constructor(data: IDataIterator<Candlestick>, start: Uid, interval: TimeInterval) {
        this.data = data;
        this.start = start;
        this.interval = interval;
        this.first = data.first && data.first.uid;
        this.last = data.last && data.last.uid;
    }

    public reset(): void {
        this.cur = undefined;
        this.data.reset();
    }

    public get current(): Uid {
        if (this.cur === undefined) {
            throw new Error('Iterator is not initialized.');
        }
        return this.cur;
    }

    public moveNext(): boolean {

        if (this.cur === undefined) {
            const found = this.data.goTo(item => { return item.uid.compare(this.start) === 0; });
            this.cur = new Uid(this.start.t, this.start.n);

            if (found) {
                this.outOfRange = false;
            } else {
                this.outOfRange = true;
                
            }
        } else {

            if (this.outOfRange && (this.first === undefined || this.cur.compare(this.first) < 0)) { // appending uid left from existing data
                // generate virtual uid
                this.cur.t = DateUtils.addInterval(this.cur.t, this.interval);
                this.cur.n = 0;

                if (this.first && this.cur.compare(this.first) >= 0) {
                    this.cur.t = this.first.t;
                    this.cur.n = this.first.n;
                    this.outOfRange = false;
                    // moving iterator to the first element
                    this.data.reset(); // need reset iterator after 'goTo' call
                    this.data.moveNext();
                }
            } else if (this.outOfRange && this.last !== undefined && this.cur.compare(this.last) >= 0) { // appending uid rigt from existing data
                this.cur.t = DateUtils.addInterval(this.cur.t, this.interval);
                this.cur.n = 0;
            } else {
                // iterating over existing data
                if (this.data.moveNext()) {
                    //this.cur = this.data.current.uid;
                    this.cur.t = this.data.current.uid.t;
                    this.cur.n = this.data.current.uid.n;
                } else {
                    this.outOfRange = true;
                    this.cur.t = DateUtils.addInterval(this.cur.t, this.interval);
                    this.cur.n = 0;
                }
            }
        }
        return true; // Has no bounds
    }
}

export class ExtendedTimeLine {
    private iter: IDataIterator<Candlestick>;
    private tempIter: IDataIterator<Candlestick>;

    constructor(dataSource: IDataSource<Candlestick>) {
        this.iter = dataSource.getIterator();
        this.tempIter = dataSource.getIterator();
    }

    public getIterator(start: Uid, interval: TimeInterval): IBasicIterator<Uid> {
        return new ExtendedTimeLineIterator(this.iter, start, interval);
    }

    /**
     * Searches Uid at "shift" distance from current. Adds fake values if needed.
     * @param iterator 
     * @param shift Can be positive and negative
     * @param curPosition 
     */
    public getByDistance(uid: Uid, shift: number, interval: TimeInterval): Uid {

        if (shift === 0) {
            return new Uid(uid.t, uid.n);
        }

        const it = this.tempIter;
        const first = it.first && it.first.uid;
        const last = it.last && it.last.uid;
        const origShift = shift;

        // If no items or no need to iterate over items, then just compute uid.
        if (first === undefined || last === undefined
            || (shift > 0 && uid.compare(last) >= 0) || (shift < 0 && uid.compare(first) <= 0) ) {
            return new Uid(DateUtils.addInterval(uid.t, interval, shift));
        }

        // 1. Compute distance to the first or last data source item

        let cur = uid;

        if (shift > 0 && uid.compare(first) < 0) {

            const diff = DateUtils.diffIntervals(uid.t, first.t, interval); // diff is positive

            shift -= diff;

            cur = first;

            if (shift < 0) {
                return new Uid(DateUtils.addInterval(uid.t, interval, origShift));
            } else if (shift === 0) {
                return new Uid(first.t, first.n);
            }
        } else if (shift < 0 && uid.compare(last) > 0) {

            const diff = DateUtils.diffIntervals(uid.t, last.t, interval); // diff is positive

            shift += diff;

            cur = last;

            if (shift > 0) {
                return new Uid(DateUtils.addInterval(uid.t, interval, origShift));
            } else if (shift === 0) {
                return new Uid(last.t, last.n);
            }
        }

        // 2. Iterate over real data

        const found = (shift > 0)
                ? it.goTo(item => item.uid.compare(cur) >= 0)
                : it.goWhile(item => item.uid.compare(cur) <= 0);

        if (found) {
            // Shift over the data items
            const actualMoved = it.moveTimes(shift); // +/-
            cur = it.current.uid;
            shift = shift - actualMoved;
        } else {
            throw new Error('Uid is not found inside the range');
        }

        // 3. Count remaining virtual uid

        return (shift !== 0)
            ? new Uid(DateUtils.addInterval(cur.t, interval, shift))
            : new Uid(cur.t, cur.n);
    }

    /**
     * Determines distance (amount of intervals) b/w specified Uids.
     * @param uidFrom 
     * @param uidTo 
     */
    public getDistance(uidFrom: Uid, uidTo: Uid, interval: TimeInterval): number|undefined {

        const start = uidFrom.compare(uidTo) <= 0 ? uidFrom : uidTo;
        const end = uidFrom.compare(uidTo) <= 0 ? uidTo : uidFrom;

        const it = this.tempIter;
        const first = it.first && it.first.uid;
        const last = it.last && it.last.uid;

        // If no items or no need to iterate over items, then just compute uid.
        if (first === undefined || last === undefined
            || (start.compare(first) <= 0 && end.compare(first) <= 0)
            || (start.compare(last) >= 0  && end.compare(last) >= 0) ) {
            return DateUtils.diffIntervals(start.t, end.t, interval);
        } else if (start.compare(first) <= 0 && end.compare(last) >= 0) {
            return DateUtils.diffIntervals(start.t, first.t, interval)
                + DateUtils.diffIntervals(last.t, end.t, interval)
                + it.getCount() - 1;
        } else {
            let distance = 0;
            if (start.compare(first) <= 0) {
                distance = DateUtils.diffIntervals(start.t, first.t, interval);
                // goto first
                it.reset();
                it.moveNext();
            } else if (start.compare(first) > 0 && start.compare(last) <= 0) {
                if (!it.goTo(item => item.uid.compare(start) === 0)) {
                    throw new Error(`Data source does not contain specified uid ${start.t.toISOString()}:${start.n}`);
                }
            }

            const min = end.compare(last) <= 0 ? end : last;

            // iterate over data
            while (it.moveNext() && it.current.uid.compare(min) <= 0) {
                distance += 1;
            }

            if (end.compare(last) > 0) {
                distance += DateUtils.diffIntervals(last.t, end.t, interval);
            }
            return distance;
        }
    }
}
