/**
 * Moving Average Convergence/Divergence oscillator class.
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

// MACD Line = EMA 12 - EMA 26
// Signal line = EMA(MACD)
// Historgam = MACD - Signal

export class MACDCandlestick extends CandlestickExt {

    public EMAfast: number | undefined;
    public EMAslow: number | undefined;
    /**
     * MACD line
     */
    public MACD: number | undefined;
    /**
     * Signal line
     */
    public SIG: number | undefined;
    /**
     * Histogram
     */
    public HIS: number | undefined;

    public toString(precision: number) {
        return 'MACD: '
            + `${this.MACD !== undefined ? this.MACD.toFixed(precision) : 'n/a'}`
            + ' SIG: '
            + `${this.SIG !== undefined ? this.SIG.toFixed(precision) : 'n/a'}`
            + ' HIS: '
            + `${this.HIS !== undefined ? this.HIS.toFixed(precision) : 'n/a'}`;
    }
}

export class MACDIndicator extends SimpleIndicator<MACDCandlestick> {

    protected ema: IMovingAverageStrategy;
    private extsettings: MACDSettings = new MACDSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(MACDCandlestick, source, context);
        this.name = 'MACD';

        this.ema = MovingAverageFactory.instance.create(MovingAverageType.Exponential);
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.periodFast, this.extsettings.periodSlow, this.extsettings.periodSignal);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<MACDCandlestick>, accessor: IValueAccessor): MACDCandlestick {

        const periodFast = this.extsettings.periodFast;
        const periodSlow = this.extsettings.periodSlow;
        const periodSig = this.extsettings.periodSignal;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new MACDCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = accessor(source);
        if (value !== undefined) {

            // Compute Slow EMA
            const lastComputedEMAslow = lastComputed !== undefined ? lastComputed.EMAslow : undefined;
            computed.EMAslow = this.ema.compute(periodSlow, sourceItems, accessor, undefined, lastComputedEMAslow);

            // Compute Fast EMA
            const lastComputedEMAfast = lastComputed !== undefined ? lastComputed.EMAfast : undefined;
            computed.EMAfast = this.ema.compute(periodFast, sourceItems, accessor, undefined, lastComputedEMAfast);

            if (computed.EMAslow !== undefined && computed.EMAfast !== undefined) {

                // Compute MACD line
                computed.MACD = computed.EMAfast - computed.EMAslow;

                // Compute Signal line
                const lastComputedSig = lastComputed !== undefined ? lastComputed.SIG : undefined;
                computed.SIG = this.ema.compute(periodSig, computedArray, c => (<MACDCandlestick>c).MACD, computed, lastComputedSig);

                if (computed.SIG !== undefined) {
                    // Computed Histogram
                    computed.HIS = computed.MACD - computed.SIG;
                }

                computed.c = computed.MACD;
                computed.h = Math.max(computed.MACD, computed.SIG !== undefined ? computed.SIG : -Infinity, computed.HIS !== undefined ? computed.HIS : -Infinity);
                computed.l = Math.min(computed.MACD, computed.SIG !== undefined ? computed.SIG : -Infinity, computed.HIS !== undefined ? computed.HIS : -Infinity);
            }
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('periodFast', new SettingSet({
            name: 'periodFast',
            value: this.extsettings.periodFast.toString(),
            settingType: SettingType.numeric,
            displayName: 'Fast period'
        }));

        group.setSetting('periodSlow', new SettingSet({
            name: 'periodSlow',
            value: this.extsettings.periodSlow.toString(),
            settingType: SettingType.numeric,
            displayName: 'Slow period'
        }));

        group.setSetting('periodSignal', new SettingSet({
            name: 'periodSignal',
            value: this.extsettings.periodSignal.toString(),
            settingType: SettingType.numeric,
            displayName: 'Signal period'
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
        const periodFast = value.getSetting('datasource.periodFast');
        this.extsettings.periodFast = (periodFast && periodFast.value) ? parseInt(periodFast.value, 10) : this.extsettings.periodFast;

        const periodSlow = value.getSetting('datasource.periodSlow');
        this.extsettings.periodSlow = (periodSlow && periodSlow.value) ? parseInt(periodSlow.value, 10) : this.extsettings.periodSlow;

        const periodSignal = value.getSetting('datasource.periodSignal');
        this.extsettings.periodSignal = (periodSignal && periodSignal.value) ? parseInt(periodSignal.value, 10) : this.extsettings.periodSignal;

        const valueType = value.getSetting('datasource.valueType');
        this.settings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.settings.valueType;

        // recompute
        this.compute();
    }
}

class MACDSettings {
    public periodFast: number = 12;    // Fast period
    public periodSlow: number = 26;     // Slow period
    public periodSignal: number = 9;     // Signal period
    constructor() { }
}

export class MACDIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // MACD
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#0026FF');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof MACDCandlestick) {
                const c = <MACDCandlestick>item;
                if (c && c.MACD !== undefined) {
                    const value = c.MACD;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Signal
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#FF0800');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof MACDCandlestick) {
                const c = <MACDCandlestick>item;
                if (c && c.SIG !== undefined) {
                    const value = c.SIG;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Histogram
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#399F16');

        const y0 = yAxis.toX(0);
        const wi = frame.w / timeAxis.count;

        RenderUtils.iterate(timeAxis, data, (item, x) => {
            if (item instanceof MACDCandlestick) {
                const m = <MACDCandlestick>item;
                if (m && m.HIS !== undefined) {
                    const y = yAxis.toX(m.HIS);
                    if (wi >= 2) {
                        canvas.rect(x - wi / 2, Math.min(y, y0), wi, Math.abs(y - y0));
                    } else {
                        canvas.moveTo(x, y0);
                        canvas.lineTo(x, y);
                    }
                }
            }
        });
        canvas.stroke();
    }

    public testHitArea(
           hitPoint: IPoint,
           data: IDataIterator<Candlestick>,
           frame: IRect,
           timeAxis: ITimeAxis,
           yAxis: IAxis<number>): Candlestick | undefined {
               return undefined;
    }

    public getSettings(): SettingSet {
        return new SettingSet('visual');
    }

    public setSettings(settings: SettingSet): void {
    }
}
