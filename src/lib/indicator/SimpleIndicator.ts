/**
 * SimpleIndicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { Utils } from './Utils';
import { ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export abstract class SimpleIndicator extends IndicatorDataSource<Candlestick> {

    protected settings: SimpleSettings = new SimpleSettings();

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(Candlestick, source, addInterval);
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        const accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        const N = this.settings.period;
        const sourceItems = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });

        // Get source data without loading
        const iterator: IDataIterator<Candlestick> = this.source.getIterator();

        // Select last source items
        if (arg) {
            const prev = IndicatorDataSource.getPreviousItems(iterator, N - 1, arg);
            sourceItems.pushRange(prev);
        }

        // Get last moving average
        let lastComputed: Candlestick | undefined;
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uid.compare(arg.uidFirst) === 0) && iter.movePrev()) {
                lastComputed = iter.current; //.c;
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
        const computedArray: Candlestick[] = [];

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;
            sourceItems.push(iterator.current);

            const computed = this.computeOne(sourceItems, accessor, lastComputed);

            computedArray.push(computed);
            lastComputed = computed;
        } while (iterator.moveNext());

        // Merge
        this.dataStorage.merge(computedArray);

        // Merge new data and notify subscribers
        return new DataChangedArgument(firstUid, lastUid, computedArray.length);
    }

    protected abstract computeOne(sourceItems: FixedSizeArray<Candlestick>,
                                  accessor: (candle: Candlestick) => number|undefined,
                                  lastComputed: Candlestick|undefined): Candlestick;

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Period'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        // recompute
        this.compute();
    }
}

export class SimpleSettings {
    public period: number = 20;
    constructor() { }
}
