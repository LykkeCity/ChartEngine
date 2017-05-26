/**
 * William's %R oscillator class.
 */
import { ICanvas } from '../canvas/index';
import { GainLossExtension } from '../compute/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Range: [-100; 0]
// %R = (Highest High - Close)/(Highest High - Lowest Low) * -100

export class PCROscillator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;
    private ext: GainLossExtension;

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(CandlestickExt, source, addInterval);
        this.name = 'PCR';

        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>): CandlestickExt {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new CandlestickExt(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        if (source.c !== undefined) {
            const H = sourceItems.max(c => c.h, N); // highest high for the period
            const L = sourceItems.min(c => c.l, N); // lowest low for the period

            if (H !== undefined && L !== undefined) {
                computed.c = H !== L ? (-100) * (H - source.c) / (H - L) : 0;
                computed.h = computed.c;
                computed.l = computed.c;
            }
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            dispalyName: '%R Period'
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