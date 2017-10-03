/**
 * TimeAxis class.
 */
import { TimeAutoGrid } from '../axes/index';
import { IAxis, ITimeAxis, TimeBar, TimeInterval } from '../core/index';
import { IDataIterator, IDataSource } from '../data/index';
import { Candlestick, Uid } from '../model/index';
import { Event, IEvent, IRange, Iterator } from '../shared/index';
import { DateUtils } from '../utils/index';

export class LoadRangeEvent extends Event<LoadRangeArgument> {
}

export class LoadRangeArgument {
    constructor(
        public start: Uid,
        public end?: Uid,
        public count?: number) {
    }
}

export class TimeAxis implements ITimeAxis, Iterator<TimeBar> {

    private dataSource: IDataSource<Candlestick> | undefined;
    private iter: IDataIterator<Candlestick> | undefined;
    private tempIter: IDataIterator<Candlestick> | undefined;
    private readonly loadRangeEvent = new LoadRangeEvent();
    /**
     * Start of the current frame.
     */
    private frameStart: Uid;
    /**
     * Amount of items in the frame. Only positive.
     */
    private N: number;

    private iteratorPointer: Uid | undefined;
    private iteratorCounter: number = 0;

    /**
     * Width of the frame in pixels
     */
    private w: number;
    private g: number = 0;
    private _interval: TimeInterval;

    constructor(interval: TimeInterval, initialDate: Date, N: number, width: number) {

        if (N <= 0) {
            throw new Error('Argument "N" must be positive.');
        }
        if (width <= 0) {
            throw new Error('Argument "width" must be positive.');
        }

        // Round initial date to interval
        initialDate = DateUtils.truncateToInterval(initialDate, interval);

        this._interval = interval;
        this.N = N;
        this.w = width;
        const dateStart = DateUtils.addInterval(initialDate, interval, -N);
        this.frameStart = new Uid(initialDate);
    }

    public get loadingRange(): IEvent<LoadRangeArgument> {
        return this.loadRangeEvent;
    }

    public get interval(): TimeInterval {
        return this._interval;
    }

    public set interval(value: TimeInterval) {
        this._interval = value;

        // truncate frame start to interval
        this.frameStart.t = DateUtils.truncateToInterval(this.frameStart.t, value);
    }

    public get width(): number {
        return this.w;
    }

    public set width(value: number) {
        this.w = value;
    }

    /**
     * Determines if specified uid is located inside visible range
     * @param uid
     */
    public isVisible(uid: Uid): boolean {
        if (this.frameStart.compare(uid) > 0) {
            return false;
        }

        const frameEnd = this.shiftBy(this.tempIter, this.N, this.frameStart);
        return frameEnd.compare(uid) >= 0;
    }

    /**
     * Moves visible range so that the specified uid gets into that range.
     * @param uid
     */
    public moveTo(uid: Uid): void {
        if (this.frameStart.compare(uid) > 0) {
            if (this.tempIter && this.tempIter.goWhile(item => item.uid.compare(uid) <= 0)) {
                this.frameStart = this.tempIter.current.uid;
            }
        } else if (this.frameStart.compare(uid) < 0) {
            this.frameStart = this.shiftBy(this.tempIter, -this.N, uid);
        }
    }

    public setDataSource(dataSource: IDataSource<Candlestick>) {
        // frameStart and count remain the same.
        // clear n
        this.frameStart.n = 0;

        this.dataSource = dataSource;
        this.iter = dataSource.getIterator();
        this.tempIter = dataSource.getIterator();

        // load 3 screens
        this.load(this.frameStart, 2 * this.N);
        this.load(this.frameStart, -this.N);
    }

    private load(uid: Uid, count: number) {
        if (this.dataSource) {
            this.dataSource.load(uid, count);
            this.loadRangeEvent.trigger(new LoadRangeArgument(uid, undefined, count));
        }
    }

    private loadRange(start: Uid, end: Uid) {
        if (this.dataSource) {
            this.dataSource.loadRange(start, end);
            this.loadRangeEvent.trigger(new LoadRangeArgument(start, end));
        }
    }

    public get current(): TimeBar {
        if (this.iteratorPointer === undefined) {
            throw new Error('Iterator is not initialized.');
        }
        return { uid: this.iteratorPointer, x: this.index2x(this.iteratorCounter) };
    }

    public get count(): number {
        return this.N;
    }

    public reset(): void {
        // go to frameStart
        this.iteratorPointer = undefined;
        this.iteratorCounter = -1;
        this.found = false;
    }

    private found: boolean;

    public moveNext(): boolean {
        if (this.iteratorPointer === undefined) {
            this.iteratorPointer = new Uid(this.frameStart.t, this.frameStart.n);
            this.iteratorCounter = 0;

            const time = this.iteratorPointer.t.getTime();
            const n = this.iteratorPointer.n;
            if (this.iter) {
                this.found = this.iter.goTo(item => { return item.uid.t.getTime() === time && item.uid.n === n; });
            } else {
                this.found = false;
            }
            return true;
        } else if (this.iteratorCounter < (this.N - 1)) {

            const res = this.shiftNext(this.iter, this.found, this.iteratorPointer);
            this.found = res.f;
            this.iteratorPointer = res.uid;

            this.iteratorCounter += 1;
            return true;
        } else {
            return false;
        }
    }

    /**
     * Should search most nearest Uid to the specified Uid, as interval can be changed
     * @param uid
     */
    public toX(uid: Uid): number | undefined {

        // ensure that require uid is loaded
        if (this.dataSource) {
            this.loadRange(this.frameStart, uid);
        }

		// Compute distance b/w frame start и uid
        const dist = this.getDistance(this.frameStart, uid);
        return dist !== undefined ? this.index2x(dist) : undefined;
    }

    public toValue(x: number): Uid | undefined {
        const index = this.x2index(x);
        return this.shiftBy(this.tempIter, index, this.frameStart);
    }

    public move(direction: number) {

        if (!direction || direction === 0) {
            return;
        }

        let gnext = this.g + direction;

        const wi = this.w / this.N;
        const count = Math.floor(gnext / wi);
        gnext = gnext - (count * wi);

        if (count !== 0) {
            direction = count;
            if (this.dataSource) {
                this.load(this.frameStart, direction > 0 ? (direction + 2 * this.N) : (direction - this.N));
            }

            this.frameStart = this.shiftBy(this.tempIter, -direction, this.frameStart);
        }

        this.g = gnext;
    }

    public scale(direction: number) {

        this.g = 0;

        let newN = this.N;
        if (direction > 0) {                // zooming in
            newN = Math.floor(this.N * 0.9);
        } else if (direction < 0) {         // zooming out
            newN = Math.ceil(this.N * 1.1);
            this.load(this.frameStart, -2 * newN);
        } else {
            return;
        }

        if (newN >= 1 && newN <= 2000) {
            this.frameStart = this.shiftBy(this.tempIter, this.N - newN, this.frameStart);
            this.N = newN;
        }
    }

    /**
     * Visible range
     */
    public get range(): IRange<Uid> {
        const start = new Uid();
        start.t = this.frameStart.t;
        start.n = this.frameStart.n;
        const end = this.shiftBy(this.tempIter, this.N, this.frameStart);

        return { start: start, end: end };
    }

    public lock(uid: Uid): void {
        if (this.dataSource) {
            this.dataSource.lock(uid);
        }
    }

    /**
     * For rendering grid
     */
    public getGrid(): Iterator<TimeBar> {
        return new TimeAutoGrid(this.w, this._interval, this, this.range);
    }

    public dist(uidFrom: Uid, uidTo: Uid): number|undefined {
        return this.getDistance(uidFrom, uidTo);
    }

    public add(uid: Uid, amount: number): Uid|undefined {
        return this.shiftBy(this.tempIter, amount, uid);
    }

    /**
     * Determines distance (amount of intervals) b/w specified Uids.
     * @param uidFrom 
     * @param uidTo 
     */
    private getDistance(uidFrom: Uid, uidTo: Uid): number|undefined {
        let counter = 0;

        let curUid = uidFrom.compare(uidTo) <= 0 ? uidFrom : uidTo;
        const lastUid = uidFrom.compare(uidTo) <= 0 ? uidTo : uidFrom;

        const curTime = curUid.t.getTime();
        const lastTime = lastUid.t.getTime();

        const fo = this.tempIter ? this.tempIter.goTo(item => item.uid.compare(curUid) > 0) : false;

        if (fo && this.tempIter && this.tempIter.current.uid.compare(lastUid) < 0) {

            counter = DateUtils.diffIntervals(curUid.t, this.tempIter.current.uid.t, this.interval);

            let outOfRange = false;
            while (this.tempIter.moveNext()) {
                curUid = this.tempIter.current.uid;

                if (curUid.compare(lastUid) > 0) {
                    outOfRange = true;
                    break;
                }
                counter += 1;
            }

            if (!outOfRange) {
                counter += DateUtils.diffIntervals(curUid.t, lastUid.t, this.interval);
            }
        } else {
            counter = DateUtils.diffIntervals(curUid.t, lastUid.t, this.interval);
        }

		// Compute coordinate by index
        return (uidFrom.t < uidTo.t) ? counter : -counter;
    }

    /**
     * Searches Uid at "shift" distance from current. Adds fake values if needed.
     * @param iterator 
     * @param shift Can be positive and negative
     * @param curPosition 
     */
    private shiftBy(iterator: IDataIterator<Candlestick> | undefined, shift: number, curPosition: Uid): Uid {

        const cur = new Uid();
        cur.t = curPosition.t;
        cur.n = curPosition.n;

        if (shift === 0) {
            return cur;
        }

        // 1. Find first candle before or after current position
        //
        let found = false;
        if (iterator) {
            found = (shift > 0)
                ? iterator.goTo(item => item.uid.compare(cur) > 0)
                : iterator.goWhile(item => item.uid.compare(cur) < 0);
        }

        if (iterator && found) {

            // Define distance b/w frame start and first found item
            const diff = DateUtils.diffIntervals(cur.t, iterator.current.uid.t, this.interval); // diff is positive

            if ((shift > 0 && diff > shift) || (shift < 0 && -diff < shift)) {
                cur.t = DateUtils.addInterval(cur.t, this._interval, shift);
                cur.n = 0;
                return cur;
            }

            shift = shift - ((shift > 0) ? diff : -diff);

            // Shift over the data items
            const actualMoved = iterator.moveTimes(shift);
            cur.t = iterator.current.uid.t;
            cur.n = iterator.current.uid.n;
            shift = shift - actualMoved;
        }

        if (shift !== 0) {
            cur.t = DateUtils.addInterval(cur.t, this._interval, shift);
            cur.n = 0;
        }

        return cur;
    }

    private shiftNext(iterator: IDataIterator<Candlestick>|undefined, found: boolean, curPosition: Uid): {f: boolean, uid: Uid} {

        const newPosition: Uid = new Uid();
        let f: boolean = found;

        if (found) {
            f = (iterator !== undefined) ? iterator.moveNext() : false;
            if (f && iterator !== undefined) {
                const cur = iterator.current;
                newPosition.t = cur.uid.t;
                newPosition.n = cur.uid.n;
            } else {
                // generate fake
                // do not try to move
                newPosition.t = DateUtils.addInterval(curPosition.t, this._interval);
                newPosition.n = 0;
            }
        } else {
            // generate fake time
            // try move pointer
            newPosition.t = DateUtils.addInterval(curPosition.t, this._interval);
            newPosition.n = 0;
        }
        return { f: f, uid: newPosition };
    }

    /**
     * Converts index of interval to x coordinate
     * @param index Interval's index
     */
    private index2x(index: number): number {
        const wi = this.w / this.N;
        return (wi * index) + (wi / 2) + this.g;
    }

    /**
     * Converts x coordinate to interval's index
     * @param x Coordinate
     */
    private x2index(x: number): number {
        const wi = this.w / this.N;
        return Math.floor((x - this.g) / wi);
    }
}
