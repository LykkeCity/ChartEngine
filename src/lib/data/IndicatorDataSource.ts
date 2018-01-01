/**
 * IndicatorDataSource class.
 */
// import {
//     //ArrayDataStorage,
//     ArrayIterator,
//     DataChangedArgument,
//     DataSource,
//     DataSourceConfig,
//     IContext,
//     IDataIterator,
//     IDataSource } from '../data/index';

import { ArrayDataStorage } from './ArrayDataStorage';
import { ArrayIterator } from './ArrayIterator';
import { DataChangedArgument } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { Candlestick, ITimeValue, IUidValue, Uid } from '../model/index';
import { IRange } from '../shared/index';
import { DateUtils } from '../utils/index';
import { IContext, IDataIterator, IDataSource, IIndicator } from './Interfaces';

/**
 * 1-to-1 mapping with source.
 * uid the same as in source.
 */
export abstract class IndicatorDataSource<C extends Candlestick> extends DataSource {

    protected isInitialized = false;
    protected source: IDataSource<Candlestick>;
    protected dataStorage: ArrayDataStorage<C>;
    //private indicator: IIndicator;
    protected addInterval: (date: Date, times: number) => Date;
    protected context: IContext;

    constructor (dataType: new(date: Date) => C,
                 source: IDataSource<Candlestick>,
                 context: IContext,
                 comparer?: (lhs: C, rhs: C) => number) {

        super(dataType, new DataSourceConfig(source.precision));
        this.dataStorage = new ArrayDataStorage<C>(comparer || this.defaultComparer);
        this.source = source;
        this.source.dataChanged.on(this.onDataSourceChanged);
        this.addInterval = context.addInterval; // should be initialized before computing
        this.context = context;
    }

    private defaultComparer = (lhs: C, rhs: C) => { return lhs.uid.compare(rhs.uid); };

    public getIterator(filter?: (item: C) => boolean): IDataIterator<C> {
        if (!this.isInitialized) {
            this.compute();
            this.isInitialized = true;
        }
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
        iterator.movePrevWhile((item, counter) => {
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
        iterator.movePrevWhile((item, counter) => {
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
