/**
 * 
 */
import { IIndicatorExtension, SettingSet, TimeInterval } from '../core/index';
import { Candlestick, IUidValue, Uid } from '../model/index';
import { FixedSizeArray, IEvent, IHashTable, IRange } from '../shared/index';
import { DataChangedArgument, DataChangedEvent } from './DataChangedEvent';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataIterator, IDataSource, IDataStorage } from './Interfaces';

export abstract class DataSource implements IDataSource<Candlestick> {
    protected readonly _config: DataSourceConfig;
    protected readonly dateChangedEvent = new DataChangedEvent();
    protected readonly _dataType: { new(d: Date): Candlestick };
    protected timeRange?: IRange<Date>;

    protected abstract dataStorage: IDataStorage<Candlestick>;

    constructor(
        dataType: { new(d: Date): Candlestick },
        config: DataSourceConfig) {

        this._dataType = dataType;
        this._config = config;
    }

    // TODO: Derived classes have their own settings.
    public get config(): DataSourceConfig{
        return this._config;
    }

    public get dataChanged(): IEvent<DataChangedArgument> {
        return this.dateChangedEvent;
    }

    public get dataType(): { new(d: Date): Candlestick } {
        return this._dataType;
    }

    private _asset: string = '';
    public get asset(): string {
        return this._asset;
    }
    public set asset(value: string) {
        this._asset = value;
    }

    private _name: string = '';
    public get name(): string {
        return this._name;
    }
    public set name(value: string) {
        this._name = value;
    }

    public get precision(): number {
        return this._config.precision;
    }
    public set precision(value: number) {
        this.config.precision = value;
    }

    public abstract load(uid: Uid, count: number): void;

    public abstract loadRange(uidFirst: Uid, uidLast: Uid): void;

    public abstract getIterator(filter?: (item: Candlestick) => boolean): IDataIterator<Candlestick>;

    private readonly defaultMinValue = 0;
    private readonly defaultMaxValue = 100;

    public getValuesRange(range: IRange<Uid>): IRange<number> {

        this.validateRange(range);

        if (this.dataStorage.isEmpty) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        const iterator = this.dataStorage.getIterator();
        if (iterator.goTo(item => item.uid.compare(range.start) >= 0)) {
            do {
                const h = iterator.current.h;
                const l = iterator.current.l;

                if (l !== undefined && l < minValue) { minValue = l; }
                if (h !== undefined && h > maxValue) { maxValue = h; }
            } while (iterator.moveNext() && iterator.current.uid.compare(range.end) <= 0);
        }

        return { start: minValue, end: maxValue };
    }

    public getHHLL(uidFrom: Uid, uidTo: Uid): Candlestick|undefined {

        const start = uidFrom.compare(uidTo) <= 0 ? uidFrom : uidTo;
        const end = uidFrom.compare(uidTo) <= 0 ? uidTo : uidFrom;

        let o = undefined;
        let c = undefined;
        let ll = undefined;
        let hh = undefined;
        let uid = undefined;

        const iterator = this.dataStorage.getIterator();
        if (iterator.goTo(item => item.uid.compare(start) >= 0)) {

            o = iterator.current.o;

            do {
                const h = iterator.current.h;
                const l = iterator.current.l;

                ll = ll === undefined ? l : Math.min(ll, l !== undefined ? l : +Infinity);
                hh = hh === undefined ? h : Math.max(hh, h !== undefined ? h : -Infinity);
                c = iterator.current.c;
                uid = iterator.current.uid;
            } while (iterator.moveNext() && iterator.current.uid.compare(end) <= 0);
        }

        return uid !== undefined ? new Candlestick(uid.t, c, o, hh, ll): undefined;
    }

    public getLastCandle(): Candlestick|undefined {
        return this.dataStorage.last;
    }

    private extensions: IHashTable<IIndicatorExtension|undefined> = {};

    public addExtension(name: string, ext: IIndicatorExtension): void {
        this.extensions[name] = ext;

        // recompute only new extension over whole extension
        this.computeExtensions(undefined, name);
    }

    public removeExtension(name: string): void {
        // replace
        this.extensions[name] = undefined;
    }

    /**
     * Computes extension values over specified range.
     * @param arg Specified range. If not specified, recompute all data.
     * @param extUid If undefined, calculates for all extensions.
     */
    protected computeExtensions(arg?: DataChangedArgument, extName?: string): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        // 1. Determine required amount of previous values. Select max of all extensions. 
        //    Check if there any extension.
        //
        let requiredLength: number = -1;
        let extCount = 0;
        for (const uid of Object.keys(this.extensions)) {
            const ext = this.extensions[uid];
            if (ext && extName && uid === extName) {
                requiredLength = ext.amountRequires;
                extCount = 1;
            } else if (ext && !extName) {
                requiredLength = Math.max(requiredLength, ext.amountRequires);
                extCount += 1;
            }
        }

        if (requiredLength === -1 || extCount === 0) {
            return arg;
        }

        // 2. Load previous values (if range is constrained). Init fixed size array
        //
        const line = new FixedSizeArray<Candlestick>(requiredLength, (lhs, rhs) => { throw new Error('Not implemented.'); });
        const iterator: IDataIterator<Candlestick> = this.dataStorage.getIterator();
        if (arg) {
            if (!iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
                throw new Error('Source does not contain updated data');
            }

            // Fill fixed sized array
            const array: Candlestick[] = [];
            let counter = 0;
            while (counter < requiredLength && iterator.movePrev()) {
                array[counter] = iterator.current;
                counter += 1;
            }

            // Put in back order
            for (let i = array.length - 1; i >= 0; i -= 1) {
                line.push(array[i]);
            }

            // Return to first element
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);

        } else {
            // go to first element
            if (!iterator.moveNext()) { return; } // Finish if no data
            // Fixed size array can not be filled
        }

        // 3. Compute (if range is constrained - till the end of array)
        //
        do {
            // Add current element
            line.push(iterator.current);

            for (const uid of Object.keys(this.extensions)) {
                const ext = this.extensions[uid];
                if (ext && extName && uid === extName) {
                    ext.extend(line);
                } else if (ext && !extName) {
                    ext.extend(line);
                }
            }
        } while (iterator.moveNext());

        // 4. Return __original__ range.
        return arg;
    }

    public abstract lock(uid: Uid): void;

    public abstract dispose(): void;

    public setTimeRange(range: IRange<Date>): void {
        this.timeRange = range;
    }

    public getSettings(): SettingSet {
        return new SettingSet('datasource');
    }

    public setSettings(settings: SettingSet): void {
        return;
    }

    protected validateDateRange(range: IRange<Date>): void {
        if (!range) { throw new Error('Argument "range" is not defined.'); }
        if (!range.start || !range.end) { throw new Error('Range is not defined.'); }
        if (range.start > range.end) { throw new Error('Start of specified range should not be less then end.'); }
    }

    protected validateRange(range: IRange<Uid>): void {
        if (!range) { throw new Error('Argument "range" is not defined.'); }
        if (!range.start || !range.end) { throw new Error('Range is not defined.'); }
        if (range.start.t > range.end.t) {
            throw new Error('Start of specified range should not be less then end.');
        } else if (range.start.t.getTime() === range.end.t.getTime() && range.start.n > range.end.n) {
            throw new Error('Start of specified range should not be less then end.');
        }
    }

    protected validateInterval(interval: TimeInterval): void {
        if (!interval) { throw new Error('Argument "interval" is not defined.'); }
    }
}
