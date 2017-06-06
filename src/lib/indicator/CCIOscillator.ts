/**
 * Commodity Channel Index oscillator class.
 */
import { ICanvas } from '../canvas/index';
import { GainLossExtension } from '../compute/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
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

// CCI = (1/0.015) * (Pt - SMA(Pt)) / Deviation(Pt),
//    Pt - typical price
//    Deviation - Mean absolute deviation

export class CCICandlestick extends CandlestickExt {
    public SMA: number|undefined;
}

export class CCIOscillator extends SimpleIndicator<CCICandlestick> {

    private ma: IMovingAverageStrategy;
    private ext: GainLossExtension;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CCICandlestick, source, context);
        this.name = 'CCI';

        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.hlc3); // by default use typical price
        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // Set default settings
        this.settings.period = 20;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CCICandlestick>): CCICandlestick {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new CCICandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = this.accessor(source);
        if (value !== undefined) {

            // Compute SMA
            const lastComputedSMA = lastComputed !== undefined ? lastComputed.SMA : undefined;
            computed.SMA = this.ma.compute(N, sourceItems, this.accessor, undefined, lastComputedSMA);

            if (computed.SMA !== undefined) {
                // Compute deviation around SMA.
                const mad = Utils.MAD(N, sourceItems, this.accessor, computed.SMA);

                if (mad !== undefined) {
                    // Compute CCI
                    computed.c = (value - computed.SMA) / (0.015 * mad);
                    computed.h = computed.c;
                    computed.l = computed.c;
                }
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
