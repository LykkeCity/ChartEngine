/**
 * Mean Deviation Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage, IIndicator } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// MD = EMA(EMA(price - EMA(price)))

export class MDCandlestick extends CandlestickExt {
    public EMA1: number | undefined;
    public EMA2: number | undefined;
    public dev: number | undefined; // = price - EMA
}

export class MDIndicator extends SimpleIndicator<MDCandlestick> {

    private ema: IMovingAverageStrategy;
    private extsettings: MDSettings = new MDSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(MDCandlestick, source, context);
        this.name = 'MD';

        this.ema = MovingAverageFactory.instance.create(MovingAverageType.Exponential);
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.period1, this.extsettings.period2, this.extsettings.period3);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<MDCandlestick>, accessor: IValueAccessor): MDCandlestick {

        const period1 = this.extsettings.period1;
        const period2 = this.extsettings.period2;
        const period3 = this.extsettings.period3;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = new MDCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = accessor(source);
        if (value !== undefined) {

            const lastComputedEMA1 = lastComputed !== undefined ? lastComputed.EMA1 : undefined;

            // 1. Compute EMA1
            computed.EMA1 = this.ema.compute(period1, sourceItems, accessor, undefined, lastComputedEMA1);

            if (computed.EMA1 !== undefined) {
                computed.dev = value - computed.EMA1;

                // 2. Compute EMA 2 on base of EMA1
                const lastComputedEMA2 = lastComputed !== undefined ? lastComputed.EMA2 : undefined;
                computed.EMA2 = this.ema.compute(period2, computedArray, item => (<MDCandlestick>item).dev, computed, lastComputedEMA2);

                if (computed.EMA2 !== undefined) {

                    // Compute EMA3
                    const lastComputedEMA3 = lastComputed !== undefined ? lastComputed.c : undefined;
                    computed.c = this.ema.compute(period3, computedArray, item => (<MDCandlestick>item).EMA2, computed, lastComputedEMA3);
                    computed.h = computed.c;
                    computed.l = computed.c;
                }
            }
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period1', new SettingSet({
            name: 'period1',
            value: this.extsettings.period1.toString(),
            settingType: SettingType.numeric,
            displayName: '1st smoothing period'
        }));

        group.setSetting('period2', new SettingSet({
            name: 'period2',
            value: this.extsettings.period2.toString(),
            settingType: SettingType.numeric,
            displayName: '2nd smoothing period'
        }));

        group.setSetting('period3', new SettingSet({
            name: 'period3',
            value: this.extsettings.period3.toString(),
            settingType: SettingType.numeric,
            displayName: '3d smoothing period'
        }));

        group.setSetting('valueType', new SettingSet({
            name: 'valueType',
            displayName: 'Calculate using',
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
        const period1 = value.getSetting('datasource.period1');
        this.extsettings.period1 = (period1 && period1.value) ? parseInt(period1.value, 10) : this.extsettings.period1;

        const period2 = value.getSetting('datasource.period2');
        this.extsettings.period2 = (period2 && period2.value) ? parseInt(period2.value, 10) : this.extsettings.period2;

        const period3 = value.getSetting('datasource.period3');
        this.extsettings.period3 = (period3 && period3.value) ? parseInt(period3.value, 10) : this.extsettings.period3;

        const valueType = value.getSetting('datasource.valueType');
        this.settings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.settings.valueType;

        // recompute
        this.compute();
    }
}

class MDSettings {
    public period1: number = 14;    // smoothing period 1
    public period2: number = 3;     // smoothing period 2
    public period3: number = 3;     // smoothing period 3
    constructor() { }
}
