/**
 * Relative Strength Oscillator class.
 */
import { ICanvas } from '../canvas/index';
import { GainLossExtension } from '../compute/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
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

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // RSI requires Gain/Loss
        this.initExtension();

        // Set default settings
        this.settings.period = 14;
        this.settings.valueType = ValueAccessorType.close;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<RSICandlestick>, accessor: IValueAccessor): RSICandlestick {

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

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: 0, end: 100 };
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Period'
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

        const valueType = value.getSetting('datasource.valueType');
        this.settings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.settings.valueType;

        // re-init extension to new value
        this.initExtension();

        // recompute
        this.compute();
    }

    private initExtension() {
        // remove old extension and add new one
        //
        if (this.ext) {
            this.source.removeExtension(this.ext.uname);
        }

        const accessor = ValueAccessorFactory.instance.create(this.settings.valueType);
        this.ext = new GainLossExtension(accessor);
        this.source.addExtension(this.ext.uname, this.ext);
    }
}
