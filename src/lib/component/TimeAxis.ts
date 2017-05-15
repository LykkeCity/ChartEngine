/**
 * TimeAxis class.
 */
import { TimeAutoGrid } from '../axes/index';
import { IAxis, ITimeAxis, TimeInterval } from '../core/index';
import { IDataIterator, IDataSource } from '../data/index';
import { Candlestick, Uid } from '../model/index';
import { IRange } from '../shared/index';
import { DateUtils } from '../utils/index';

export class TimeAxis implements ITimeAxis {

    private dataSource: IDataSource<Candlestick> | undefined;
    private iter: IDataIterator<Candlestick> | undefined;
    private tempIter: IDataIterator<Candlestick> | undefined;
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

    // dataSource: IDataSource<Candlestick>, 
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

        //this.setDataSource(dataSource);
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

	//ondatachanged - не нужен. не надо менять frameStart и count. Но нужно dispose добавить.

    public setDataSource(dataSource: IDataSource<Candlestick>) {
        // frameStart and count remain the same.
        // clear n
        this.frameStart.n = 0;

        this.dataSource = dataSource;
        this.iter = dataSource.getIterator();
        this.tempIter = dataSource.getIterator();

        // load 3 screens
        dataSource.load(this.frameStart, 2 * this.N);
        dataSource.load(this.frameStart, -this.N);
    }

    public get current(): Uid {
        if (this.iteratorPointer === undefined) {
            throw new Error('Iterator is not initialized.');
        }
        return this.iteratorPointer;
    }

    public get currentX(): number {
        // Can be calculated by this.iteratorCounter
        return this.index2x(this.iteratorCounter);
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

    private shiftNext(iterator: IDataIterator<Candlestick>|undefined, found: boolean, curPosition: Uid): {f: boolean, uid: Uid} {

        const newPosition: Uid = new Uid();
        let f: boolean;

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

            const time = newPosition.t.getTime();
            const n = newPosition.n;
            if (iterator !== undefined) {
                f = iterator.goTo(item => {
                    return item.uid.t.getTime() === time && item.uid.n === n;
                });
            } else {
                f = false;
            }
        }
        return { f: f, uid: newPosition };
    }

    /**
     * Should search most nearest Uid to the specified Uid, as interval can be changed
     * @param uid 
     */
    public toX(uid: Uid): number | undefined { // Если возвращает undef, то не рендерить пока фигуру, т.к. не загружены данные.
		// Рассчтитьа растояние между fs и uid +1000 | -1000

        // ensure that require uid is loaded
        if (this.dataSource) {
            this.dataSource.loadRange(this.frameStart, uid);
        }

        let curUid = this.frameStart.compare(uid) <= 0 ? this.frameStart : uid;
        const lastUid = this.frameStart.compare(uid) <= 0 ? uid : this.frameStart;

        const curTime = curUid.t.getTime();
        const lastTime = lastUid.t.getTime();
        // goto start
        let fo = this.tempIter ?
            this.tempIter.goTo(item => { return item.uid.t.getTime() === curTime && item.uid.n === curUid.n; })
            : false;

        let curCompare = curUid.compare(lastUid); // This is -1 or 0

        let counter = 0;
        while (curUid.compare(lastUid) < 0) { //!(curUid.t.getTime() === lastTime && curUid.n === lastUid.n )) {

            const res = this.shiftNext(this.tempIter, fo, curUid);
            fo = res.f;
            curUid = res.uid;

            counter += 1;
        }

		// По индексу рассчитать координату
        const index = (this.frameStart.t < uid.t) ? counter : -counter;
        return this.index2x(index);
    }

    public toValue(x: number): Uid | undefined {	// x = -50, x = +1000 . 
		// Undefined на будущее. Пока можно генерировать фиктивные

        const wi = this.w / this.N;
        const index = Math.floor((x - this.g) / wi);

        // if (this.dataSource) {
        //     this.dataSource.load(this.frameStart, index);
        // }

        return this.shiftBy(this.tempIter, index, this.frameStart);
    }

    /**
     * Basically searches Uid at "shift" from current. Also adds fake values if needed
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

        const forward = shift >= 0;
        shift = Math.abs(shift);

        // Add fake intervals
        let counter = 0;
        let fo = false;
        while (!fo && counter < shift) {

            const curTime = cur.t.getTime();
            const curN = cur.n;

            fo = iterator
                ? iterator.goTo(item => { return item.uid.t.getTime() === curTime && item.uid.n === curN; })
                : false;

            if (fo) {
                break;
            }

            cur.t = DateUtils.addInterval(cur.t, this._interval, forward ? 1 : -1);
            cur.n = 0;

            counter += 1;
        }

        let remains: number = shift - counter;

        const actualMoved = iterator ? iterator.moveTimes(forward ? remains : -remains) : 0;
        if (actualMoved !== 0 && iterator)  {
            cur.t = iterator.current.uid.t;
            cur.n = iterator.current.uid.n;
        }

        remains = remains - Math.abs(actualMoved);

        if (remains > 0) {
            cur.t = DateUtils.addInterval(cur.t, this._interval, forward ? remains : -remains);
            cur.n = 0;
        }

        return cur;
    }

    private index2x(index: number): number {
        const wi = this.w / this.N;
        return (wi * index) + (wi / 2) + this.g;
    }

    public move(direction: number) {

        if (!direction || direction === 0) {
            return;
        }

        //let gnext = this.g + (direction > 0 ? 1 : -1);
        let gnext = this.g + direction;

        const wi = this.w / this.N;
        const count = Math.floor(gnext / wi);
        gnext = gnext - (count * wi);

        if (count !== 0) {
            direction = count;
            if (this.dataSource) {
                this.dataSource.load(this.frameStart, direction > 0 ? (direction + 2 * this.N) : (direction - this.N));
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

            if (this.dataSource) {
                this.dataSource.load(this.frameStart, -2 * newN);
            }

        } else {
            return;
        }

        if (newN >= 1 && newN <= 2000) {
            this.frameStart = this.shiftBy(this.tempIter, this.N - newN, this.frameStart);
            this.N = newN;
        }
    }

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
    public getGrid(): Date[] {

        const times: Uid[] = [];
        this.reset();
        while (this.moveNext()) {
            times.push(this.current);
        }

        const dates = times.map(value => value.t);

        const autoGrid = new TimeAutoGrid(this.w, this._interval, dates);
        return autoGrid.getGrid();
    }
}
