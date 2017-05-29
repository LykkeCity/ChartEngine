/**
 * Relative Strength Levy Oscillator class.
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
import { IContext, IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// RSL = Close / MA

export class RSLCandlestick extends CandlestickExt {
    public MA: number | undefined;
}

export class RSLOscillator extends SimpleIndicator<RSLCandlestick> {

    private ma: IMovingAverageStrategy;
    private ext: GainLossExtension;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(RSLCandlestick, source, context);
        this.name = 'RSL';

        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);
        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Exponential);

        // Set default settings
        this.settings.period = 27;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<RSLCandlestick>): RSLCandlestick {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new RSLCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = this.accessor(source);

        // Compute average gain/loss
        const lastComputedMA = lastComputed !== undefined ? lastComputed.MA : undefined;
        computed.MA = this.ma.compute(N, sourceItems, this.accessor, undefined, lastComputedMA);

        if (computed.MA !== undefined && value !== undefined) {
            computed.c = computed.MA !== 0 ? value / computed.MA : undefined;
            computed.h = computed.c;
            computed.l = computed.c;
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
