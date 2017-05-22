/**
 * SimpleIndicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { Utils } from './Utils';
import { ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export abstract class SimpleIndicator<T extends CandlestickExt> extends IndicatorDataSource<T> {

    protected settings: SimpleSettings = new SimpleSettings();

    constructor (dataType: new(date: Date) => T, source: IDataSource<Candlestick>, addInterval: (date: Date, times: number) => Date) {
        super(dataType, source, addInterval, (lhs: T, rhs: T) => { return lhs.uidOrig.compare(rhs.uidOrig); });
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        let computedArray: T[] = [];
        const accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        const N = this.settings.period;
        const sourceItems = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });
        const computedItems = new FixedSizeArray<T>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });

        // Get source data without loading
        const iterator: IDataIterator<Candlestick> = this.source.getIterator();

        // Select last source items
        if (arg) {
            if (!iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
                throw new Error('Source does not contain updated data');
            }
            const prev = IndicatorDataSource.getPreviousItems(iterator, N - 1);
            sourceItems.pushRange(prev);
        }

        // Get last computed items
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uidOrig.compare(arg.uidFirst) === 0)) {
                computedArray = IndicatorDataSource.getPreviousItems(iter, N - 1);
                computedItems.pushRange(computedArray);
            }
        }

        // Go to first element
        if (arg) {
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!iterator.moveNext()) { throw new Error('Source does not contain updated data'); }
        }

        // Calculations
        // 

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;
            sourceItems.push(iterator.current);

            const computed = this.computeOne(sourceItems, accessor, computedItems);

            computedArray.push(computed);
            computedItems.push(computed);
            //lastComputed = computed;
        } while (iterator.moveNext());

        // Merge using origUid, not uid
        this.dataStorage.merge(computedArray);

        const origArg = new DataChangedArgument(firstUid, lastUid, computedArray.length);
        // Update shift
        const shiftedArg = this.shift(origArg, this.settings.displacement);
        return shiftedArg;
    }

    protected abstract computeOne(sourceItems: FixedSizeArray<Candlestick>,
                                  accessor: (candle: Candlestick) => number|undefined,
                                  //computed: T[]
                                  computed: FixedSizeArray<T>
                                  ): T;


    protected shift(arg: DataChangedArgument, shift: number): DataChangedArgument {
        // TODO: arg can narrow shift area

        if (shift > 0) {
            this.shiftRight(shift);
        } else if (shift < 0) {
            this.shiftLeft(shift);
        } else {
            this.noshift();
            return arg;
        }

        // Build new DataChangeArgument
        let shiftedFirstUid;
        let shiftedLastUid;
        const iter = this.dataStorage.getIterator();
        if (iter.goTo(item => item.uidOrig.compare(arg.uidFirst) === 0) ) {
            shiftedFirstUid = iter.current.uid;
        }
        if (iter.goTo(item => item.uidOrig.compare(arg.uidLast) === 0) ) {
            shiftedLastUid = iter.current.uid;
        }

        // TODO: Init lastUidBefore/lastUidAfter.
        return new DataChangedArgument(
            shiftedFirstUid || arg.uidFirst,
            shiftedLastUid || arg.uidLast,
            arg.count
        );
    }

    private noshift() {
        // Just copy uid
        const iter = this.dataStorage.getIterator();
        while (iter.moveNext()) {
            iter.current.uid = iter.current.uidOrig;
        }
    }

    // TODO: Unite with shiftRight
    private shiftLeft(shift: number) {
        let isFake = false;
        const iterFirst = this.dataStorage.getIterator();
        const iterLast = this.dataStorage.getIterator();

        if (!iterFirst.goToLast() || !iterLast.goToLast()) {
            // no items to shift
            return;
        }

        // Shift first iterator to start position
        //
        let counter = 0;
        let uidFirst = iterFirst.current.uidOrig;
        while (counter < Math.abs(shift)) {
            isFake = !iterFirst.movePrev();
            if (isFake) {
                uidFirst = this.shiftUid(uidFirst, -1);
            } else {
                uidFirst = iterFirst.current.uidOrig;
            }
            counter += 1;
        }

        // Start copying uid loop 
        //
        do {
            // Move uid
            iterLast.current.uid = new Uid(uidFirst.t, uidFirst.n);

            // Shift one step
            isFake = !iterFirst.movePrev();
            if (isFake) {
                uidFirst = this.shiftUid(uidFirst, -1);
            } else {
                uidFirst = iterFirst.current.uidOrig;
            }
        } while (iterLast.movePrev());
    }

    private shiftRight(shift: number) {
        let isFake = false;
        const iterFirst = this.dataStorage.getIterator();
        const iterLast = this.dataStorage.getIterator();

        if (!iterFirst.moveNext() || !iterLast.moveNext()) {
            // no items to shift
            return;
        }

        // Shift first iterator to start position
        //
        let counter = 0;
        let uidFirst = iterFirst.current.uidOrig;
        while (counter < Math.abs(shift)) {
            isFake = !iterFirst.moveNext();
            if (isFake) {
                uidFirst = this.shiftUid(uidFirst, 1);
            } else {
                uidFirst = iterFirst.current.uidOrig;
            }
            counter += 1;
        }

        // Start copying uid loop 
        //
        do {
            // Move uid
            iterLast.current.uid = new Uid(uidFirst.t, uidFirst.n);

            // Shift one step
            isFake = !iterFirst.moveNext();
            if (isFake) {
                uidFirst = this.shiftUid(uidFirst, 1);
            } else {
                uidFirst = iterFirst.current.uidOrig;
            }
        } while (iterLast.moveNext());
    }

    private shiftUid(uid: Uid, shift: number): Uid {
        return new Uid(
            this.addInterval(uid.t, shift)
        );
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Period'
        }));

        group.setSetting('displacement', new SettingSet({
            name: 'displacement',
            value: this.settings.displacement.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Displacement'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        const displacement = value.getSetting('datasource.displacement');
        this.settings.displacement = (displacement && displacement.value) ? parseInt(displacement.value, 10) : this.settings.displacement;

        // recompute
        this.compute();
    }
}

export class SimpleSettings {
    public period: number = 20;
    public displacement: number = 0;
    public upperThreshold: number = 0;
    public lowerThreshold: number = 0;
    constructor() { }
}
