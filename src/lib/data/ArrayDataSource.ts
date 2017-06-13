/**
 * ArrayDataSource class.
 */
import { TimeInterval } from '../core/index';
import { Candlestick, ITimeValue, IUidValue, Uid } from '../model/index';
import { IRange } from '../shared/index';
import { DateUtils } from '../utils/index';
import { ArrayDataStorage } from './ArrayDataStorage';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataIterator } from './Interfaces';

export class ArrayDataSource extends DataSource {

    protected readonly dataStorage: ArrayDataStorage<Candlestick>;
    // private readonly defaultMinValue = 0;
    // private readonly defaultMaxValue = 100;

    protected comparer = (item1: IUidValue, item2: IUidValue) => { return item1.uid.compare(item2.uid); };
//    protected readonly comparer = (item1: IUidValue, item2: IUidValue) => { return item1.date.getTime() - item2.date.getTime(); };

    constructor(
        dataType: { new(d: Date): Candlestick },
        config: DataSourceConfig,
        data: Candlestick[],
        comparer?: (item1: IUidValue, item2: IUidValue) => number
        ) {
            super(dataType, config);

            if (comparer) {
                this.comparer = comparer;
            }

            const initData = data.slice();
            initData.sort(this.comparer);

            this.dataStorage = new ArrayDataStorage<Candlestick>(this.comparer, initData);
    }

    public load(uid: Uid, count: number): void {
    }

    public loadRange(uidFirst: Uid, uidLast: Uid): void {
    }

    public getIterator(filter?: (item: Candlestick) => boolean): IDataIterator<Candlestick> {
        // return everything
        return this.dataStorage.getIterator(filter);
    }

    public lock(uid: Uid): void { }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
        );
    }

    public dispose(): void { }
}
