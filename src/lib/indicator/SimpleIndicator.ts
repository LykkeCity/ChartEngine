/**
 * SimpleIndicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage, IndicatorDataSource } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export abstract class SimpleIndicator<T extends CandlestickExt> extends IndicatorDataSource<T> {

    protected settings: SimpleSettings = new SimpleSettings();

    constructor (dataType: new(date: Date) => T, source: IDataSource<Candlestick>, context: IContext) {
        super(dataType, source, context, (lhs: T, rhs: T) => { return lhs.uidOrig.compare(rhs.uidOrig); });
    }

    protected get requiredItemsOnCompute(): number {
        return this.settings.period; // By default loading period number of items
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        const accessor = ValueAccessorFactory.instance.create(this.settings.valueType);

        // Remove extended (fake) items
        this.dataStorage.trimRight(item => item.isFake);
        this.dataStorage.trimLeft(item => item.isFake);

        let computedArray: T[] = [];

        const N = this.requiredItemsOnCompute; //this.settings.period;
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
            if (!iterator.moveNext()) { return; } // Finish if no data
        }

        // Calculations
        // 

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;
            sourceItems.push(iterator.current);

            const computed = this.computeOne(sourceItems, computedItems, accessor);

            computedArray.push(computed);
            computedItems.push(computed);
            //lastComputed = computed;
        } while (iterator.moveNext());

        // Merge using origUid, not uid
        this.dataStorage.merge(computedArray);

        this.afterCompute(arg);

        const origArg = new DataChangedArgument(firstUid, lastUid, computedArray.length);
        // Update shift
        const shiftedArg = this.shiftTime(origArg, this.settings.displacement);
        return shiftedArg;
    }

    protected abstract computeOne(sourceItems: FixedSizeArray<Candlestick>, computed: FixedSizeArray<T>, accessor: IValueAccessor): T;

    protected afterCompute(arg?: DataChangedArgument) {
    }

    protected shiftTime(arg: DataChangedArgument, shift: number): DataChangedArgument {
        // TODO: arg can narrow shift area

        if (shift > 0) {
            this.shiftTimeRight(shift);
        } else if (shift < 0) {
            this.shiftTimeLeft(shift);
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
    private shiftTimeLeft(shift: number) {
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

    private shiftTimeRight(shift: number) {
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

    protected shiftDataExt(shift: number, replace: (dest: T, source?: T) => void) {

        const iter = this.dataStorage.getIterator();

        this.extend(shift, iter);

        const iterLead = this.dataStorage.getIterator();
        const iterFollow = this.dataStorage.getIterator();

        if (shift > 0) {

            let lead = false;
            let follow = false;

            // Move lead iterator to the last not fake item
            lead = iterLead.goToLast();

            let counter = 0;
            iterLead.somebackward(item => {
                counter += 1;
                return item.isFake;
            });

            // Follow iterator should be "shift" items back from lead
            follow = iterFollow.goToLast();
            counter = counter - (shift + 1);
            while (counter > 0) { follow = iterFollow.movePrev(); counter -= 1; }

            while (follow) {

                const source = lead ? iterLead.current : undefined;
                const dest = iterFollow.current;

                replace(dest, source); // source can be undefined

                // Move both iterators left
                lead = iterLead.movePrev();
                follow = iterFollow.movePrev();
            }

        } else if (shift < 0) {

            let lead = false;
            let follow = false;

            // Move lead iterator to the first not fake item
            let moves = iterLead.moveNext() ? iterLead.moveTo(item => !item.isFake) : -1; // Before moveTo, moveNext should be called
            lead = moves > 0;

            // Follow iterator should be "shift" items back from lead
            moves = moves - Math.abs(shift);
            while (moves > 0) { follow = iterFollow.moveNext(); moves -= 1; }

            while (follow) {

                const source = lead ? iterLead.current : undefined;
                const dest = iterFollow.current;

                replace(dest, source); // source can be undefined

                // Move both iterators left
                lead = iterLead.moveNext();
                follow = iterFollow.moveNext();
            }

        } else { // shift === 0
            // Source and dest is the same element
            while (iterLead.moveNext()) {
                replace(iterLead.current, iterLead.current);
            }
        }
    }

    private extend(shift: number, iter: IDataIterator<T>) {
        if (shift === 0) {
            return;
        }

        // Add fake items. Working with uid_orig
        // If there are already fake items, they should not be removed.

        const extended: T[] = [];

        if (shift < 0) {
            // Get count of fake items
            const moved = iter.moveNext() ? iter.moveTo(item => !item.isFake) : -1; // Before moveTo, moveNext should be called
            const fakeItems = (moved !== -1) ? moved - 1 : 0;

            // Add fake items
            const add = Math.abs(shift) - fakeItems;

            // Get first element
            if (iter.goTo(item => true)) {
                let uid = iter.current.uid;

                for (let i = 0; i < add; i += 1) {
                    uid = this.shiftUid(uid, shift < 0 ? -1 : 1);
                    const ext = <T>new this.dataType(uid.t);
                    ext.isFake = true;
                    ext.uidOrig = new Uid(uid.t);
                    extended.push(ext);
                }
            }
        } else if (shift > 0) {
            if (iter.goToLast()) {
                let moved = 0;
                iter.somebackward((item, counter) => {
                    moved = counter;
                    return item.isFake;
                });
                const fakeItems = moved;
                const add = Math.abs(shift) - fakeItems;

                iter.goToLast();
                let uid = iter.current.uid;
                for (let i = 0; i < add; i += 1) {
                    uid = this.shiftUid(uid, shift < 0 ? -1 : 1);
                    const ext = <T>new this.dataType(uid.t);
                    ext.isFake = true;
                    ext.uidOrig = new Uid(uid.t);
                    extended.push(ext);
                }
            }
        }

        this.dataStorage.merge(extended);
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

        group.setSetting('valueType', new SettingSet({
            name: 'valueType',
            dispalyName: 'Calculate using',
            value: this.settings.valueType.toString(),
            settingType: SettingType.select,
            options: [
                { value: ValueAccessorType.close.toString(), text: 'close' },
                { value: ValueAccessorType.open.toString(), text: 'open' },
                { value: ValueAccessorType.high.toString(), text: 'high' },
                { value: ValueAccessorType.low.toString(), text: 'low' },
                { value: ValueAccessorType.hl2.toString(), text: 'hl2' },
                { value: ValueAccessorType.hlc3.toString(), text: 'hlc3' },
                { value: ValueAccessorType.ohlc4.toString(), text: 'ohlc4' },
                { value: ValueAccessorType.hlcc4.toString(), text: 'hlcc4' }
            ]
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        const displacement = value.getSetting('datasource.displacement');
        this.settings.displacement = (displacement && displacement.value) ? parseInt(displacement.value, 10) : this.settings.displacement;

        const valueType = value.getSetting('datasource.valueType');
        this.settings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.settings.valueType;

        // recompute
        this.compute();
    }
}

export class SimpleSettings {
    public period: number = 20;
    public displacement: number = 0;
    public upperThreshold: number = 0;
    public lowerThreshold: number = 0;
    public valueType: ValueAccessorType = ValueAccessorType.close;
}
