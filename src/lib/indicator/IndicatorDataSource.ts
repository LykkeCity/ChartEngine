/**
 * IndicatorDataSource class.
 */
import {
    ArrayDataStorage,
    ArrayIterator,
    DataChangedArgument,
    DataSource,
    DataSourceConfig,
    IDataIterator,
    IDataSource } from '../data/index';
import { Candlestick, ITimeValue, IUidValue, Uid } from '../model/index';
import { IRange } from '../shared/index';
import { IIndicator } from './Interfaces';

/**
 * 1-to-1 mapping with source.
 * uid the same as in source.
 */
export abstract class IndicatorDataSource<C extends Candlestick> extends DataSource {

    protected source: IDataSource<Candlestick>;
    protected dataStorage: ArrayDataStorage<C>;
    //private indicator: IIndicator;
    protected addInterval: (date: Date, times: number) => Date;

    constructor (dataType: new(date: Date) => C,
                 source: IDataSource<Candlestick>,
                 addInterval: (date: Date, times: number) => Date,
                 comparer?: (lhs: C, rhs: C) => number) {

        super(dataType, new DataSourceConfig());
        this.dataStorage = new ArrayDataStorage<C>(comparer || this.defaultComparer);
        this.source = source;
        this.source.dataChanged.on(this.onDataSourceChanged);
        this.addInterval = addInterval; // should be initialized before computing
    }

    private defaultComparer = (lhs: C, rhs: C) => { return lhs.uid.compare(rhs.uid); };

    public getIterator(filter?: (item: C) => boolean): IDataIterator<C> {
        return this.dataStorage.getIterator(filter);
    }

    public dispose(): void {
        this.source.dataChanged.off(this.onDataSourceChanged);
    }

    public load(uid: Uid, count: number): void { }

    public loadRange(uidFirst: Uid, uidLast: Uid): void { }

    public lock(uid: Uid): void { }

    protected triggerDataChanged = (arg: DataChangedArgument) => {
        this.dateChangedEvent.trigger(arg);
    }

    protected onDataSourceChanged = (arg: DataChangedArgument) => {
        const generatedArg = this.compute(arg);
        if (generatedArg) {
            this.triggerDataChanged(generatedArg);
        }
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig();
    }

    protected abstract compute(arg?: DataChangedArgument): DataChangedArgument | undefined;

    /**
     * Returns last values from source
     */
    protected static getPreviousValues<T extends Candlestick>(
        iterator: IDataIterator<T>,
        N: number,
        arg: DataChangedArgument,
        accessor: (candle: T) => number|undefined): number[] {

        if (!iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
            throw new Error('Source does not contain updated data');
        }

        const array: number[] = [];
        iterator.somebackward((item, counter) => {
            if (counter > N) { return false; }
            if (counter > 0) {
                const val = accessor(item);
                if (val !== undefined) { array.push(val); }
                return true;
            }
            return true; // Skip current item
        });
        array.reverse();
        return array;
    }

    protected static getPreviousItems<T extends Candlestick>(
        iterator: IDataIterator<T>,
        N: number): T[] {

        const array: T[] = [];
        iterator.somebackward((item, counter) => {
            if (counter > N) { return false; }
            if (counter > 0) {
                array.push(item);
                return true;
            }
            return true; // Skip current item
        });
        array.reverse();
        return array;
    }
}
