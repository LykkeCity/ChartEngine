/**
 * TimeAxis class.
 */
import { TimeAutoGrid } from '../axes/index';
import { IAxis, ITimeAxis, TimeBar, TimeInterval } from '../core/index';
import { ExtendedTimeLine, IBasicIterator, IDataIterator, IDataSource } from '../data/index';
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
    private extTimeLine: ExtendedTimeLine | undefined;
    private extTimeLineIterator: IBasicIterator<Uid> | undefined;
    //private tempIter: IDataIterator<Candlestick> | undefined;
    private readonly loadRangeEvent = new LoadRangeEvent();
    /**
     * Start of the current frame.
     */
    private frameStart: Uid;
    /**
     * Amount of items in the frame. Only positive.
     */
    private N: number;

    private iteratorCounter: number = 0;

    /**
     * Width of the frame in pixels
     */
    private w: number;
    private preciseShift: number = 0;
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
        const range = this.range;
        return range.start.compare(uid) <= 0 && range.end.compare(uid) >= 0;
    }

    /**
     * Moves visible range so that the specified uid gets into that range.
     * @param uid
     */
    public moveTo(uid: Uid): void {
        this.validateInstance();

        if (this.frameStart.compare(uid) > 0) {
            this.frameStart = new Uid(uid.t, uid.n);
        } else if (this.frameStart.compare(uid) < 0) {
            this.frameStart = this.extTimeLine!.getByDistance(uid, -this.N, this._interval);
        }
    }

    public setDataSource(dataSource: IDataSource<Candlestick>) {
        // frameStart and count remain the same.
        // clear n
        this.frameStart.n = 0;

        this.dataSource = dataSource;
        this.extTimeLine = new ExtendedTimeLine(dataSource);

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

    public get count(): number {
        return this.N;
    }

    public reset(): void {
        this.validateInstance();
        this.extTimeLineIterator = this.extTimeLine!.getIterator(this.frameStart, this._interval);
        this.iteratorCounter = 0;
    }

    public get current(): TimeBar {
        if (!this.extTimeLineIterator) {
            throw new Error('Iterator is not initialized');
        }

        if (this.iteratorCounter === 0) {
            throw new Error('Current item is undefined');
        }

        return { uid: this.extTimeLineIterator.current, x: this.index2x(this.iteratorCounter) };
    }

    public moveNext(): boolean {
        if (!this.extTimeLineIterator) {
            throw new Error('Iterator is not initialized');
        }

        let res = false;
        if (this.iteratorCounter < this.N) {
            res = this.extTimeLineIterator.moveNext();
            if (res) {
                this.iteratorCounter += 1;
            }
        }
        return res;
    }

    /**
     * Should search most nearest Uid to the specified Uid, as interval can be changed
     * @param uid
     */
    public toX(uid: Uid): number | undefined {
        this.validateInstance();

        // ensure that require uid is loaded
        if (this.dataSource) {
            this.loadRange(this.frameStart, uid);
        }

		// Compute distance b/w frame start и uid
        const dist = this.extTimeLine!.getDistance(this.frameStart, uid, this._interval);
        return dist !== undefined ? this.index2x(dist) : undefined;
    }

    public toValue(x: number): Uid | undefined {
        this.validateInstance();

        const index = this.x2index(x);
        return this.extTimeLine!.getByDistance(this.frameStart, index, this._interval);
    }

    public move(direction: number) {
        this.validateInstance();

        if (!direction || direction === 0) {
            return;
        }

        const targetShift = this.preciseShift + direction;

        const barWidth = this.w / this.N;
        const barCount = Math.floor(targetShift / barWidth);

        if (barCount !== 0) {
            // load additional data if needed
            if (this.dataSource) { this.load(this.frameStart, barCount > 0 ? (barCount + 2 * this.N) : (barCount - this.N)); }

            this.frameStart = this.extTimeLine!.getByDistance(this.frameStart, -barCount, this._interval);
        }

        this.preciseShift = targetShift - (barCount * barWidth);
    }

    public scale(direction: number) {
        this.validateInstance();

        this.preciseShift = 0;

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
            this.frameStart = this.extTimeLine!.getByDistance(this.frameStart, this.N - newN, this._interval);
            this.N = newN;
        }
    }

    /**
     * Visible range
     */
    public get range(): IRange<Uid> {
        this.validateInstance();
        return {
            start: new Uid(this.frameStart.t, this.frameStart.n),
            end: this.extTimeLine!.getByDistance(this.frameStart, this.N, this._interval)
         };
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
        this.validateInstance();
        return this.extTimeLine!.getDistance(uidFrom, uidTo, this._interval);
    }

    public add(uid: Uid, amount: number): Uid|undefined {
        this.validateInstance();
        return this.extTimeLine!.getByDistance(uid, amount, this._interval);
    }

    /**
     * Converts index of interval to x coordinate
     * @param index Interval's index
     */
    private index2x(index: number): number {
        const wi = this.w / this.N;
        return (wi * index) + (wi / 2) + this.preciseShift - wi;
    }

    /**
     * Converts x coordinate to interval's index
     * @param x Coordinate
     */
    private x2index(x: number): number {
        const wi = this.w / this.N;
        return Math.floor((x - this.preciseShift + wi) / wi);
    }

    private validateInstance(): void {
        if (!this.extTimeLine) {
            throw new Error('Data source is not initialized');
        }
    }
}
