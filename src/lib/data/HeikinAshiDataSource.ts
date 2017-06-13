/**
 * 
 */
import { IIndicatorExtension, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, DataSourceRegister,
    IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Uid } from '../model/index';
import { FixedSizeArray } from '../shared/index';
import { IndicatorDataSource } from './IndicatorDataSource';

export class HeikinAshiDataSource extends IndicatorDataSource<Candlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(Candlestick, source, context);
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        // Get source data without loading
        const iterator: IDataIterator<Candlestick> = this.source.getIterator();

        let move;
        move = arg ? iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0) : iterator.moveNext();
        if (!move) {
            throw new Error('Source does not contain updated data');
        }

        // Calculations
        // 
        const computedArray: Candlestick[] = [];

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;

            const computed = this.computeCandle(iterator.current, iterator.previous);

            computedArray.push(computed);
        } while (iterator.moveNext());

        // Merge
        this.dataStorage.merge(computedArray);

        // Merge new data and notify subscribers
        return new DataChangedArgument(firstUid, lastUid, computedArray.length);
    }

    private computeCandle(current: Candlestick, previous?: Candlestick): Candlestick {

        const computed = new Candlestick(current.date);
        computed.uid.t = current.uid.t;
        computed.uid.n = current.uid.n;

        if (current.c !== undefined && current.o !== undefined && current.h !== undefined && current.l !== undefined
          && previous && previous.c !== undefined && previous.o !== undefined) {
            // HA-Close = (Open(0) + High(0) + Low(0) + Close(0)) / 4
            const hac = (current.o + current.h + current.l + current.c) / 4;
            computed.c = hac;
            // HA-Open = (HA-Open(-1) + HA-Close(-1)) / 2
            const hao = (previous.o + previous.c) / 2;
            computed.o = hao;
            // HA-High = Maximum of the High(0), HA-Open(0) or HA-Close(0) 
            computed.h = Math.max(current.h, hao, hac);
            // HA-Low = Minimum of the Low(0), HA-Open(0) or HA-Close(0)
            computed.l = Math.max(current.l, hao, hac);
        } else if (current.c !== undefined && current.o !== undefined && current.h !== undefined && current.l !== undefined) {
            computed.c = (current.o + current.h + current.l + current.c) / 4;
            computed.o = (current.o + current.c) / 2;
            computed.h = current.h;
            computed.l = current.l;
        }
        return computed;
    }

    public load(uid: Uid, count: number): void {
        this.source.load(uid, count);
    }

    public loadRange(uidFirst: Uid, uidLast: Uid): void {
        this.source.loadRange(uidFirst, uidLast);
    }

    public lock(uid: Uid): void {
        this.source.lock(uid);
    }
}
