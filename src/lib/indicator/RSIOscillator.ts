/**
 * Relative Strength Oscillator class.
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

// RS = AVG (upward) / AVG (downward);  
// RSI = 100 - (100 / (1 + RS));

export class RSICandlestick extends CandlestickExt {
    public avgGain: number | undefined;
    public avgLoss: number | undefined;
}

export class RSIOscillator extends SimpleIndicator<RSICandlestick> {

    private ma: IMovingAverageStrategy;
    private ext: GainLossExtension;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(RSICandlestick, source, context);
        this.name = 'RSI';

        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);
        this.ma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // RSI requires Gain/Loss
        this.ext = new GainLossExtension(this.accessor); // accessor
        this.source.addExtension(this.ext.uname, this.ext);

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<RSICandlestick>): RSICandlestick {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new RSICandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        // Compute average gain/loss
        const lastComputedGain = lastComputed !== undefined ? lastComputed.avgGain : undefined;
        computed.avgGain = this.ma.compute(N, sourceItems, candle => this.ext.value(candle).gain, undefined, lastComputedGain);

        const lastComputedLoss = lastComputed !== undefined ? lastComputed.avgLoss : undefined;
        computed.avgLoss = this.ma.compute(N, sourceItems, candle => this.ext.value(candle).loss, undefined, lastComputedLoss);

        if (computed.avgGain !== undefined && computed.avgLoss !== undefined && computed.avgLoss !== 0) {
            const RS = computed.avgGain / computed.avgLoss;
            const RSI = 100 - (100 / (1 + RS));
            computed.c = RSI;
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
