/**
 * Moving Average Convergence/Divergence oscillator class.
 */
import { ICanvas } from '../canvas/index';
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

    public toString() {
        return 'MACD: '
            + `${this.MACD !== undefined ? this.MACD.toFixed(4) : 'n/a'}`
            + ' SIG: '
            + `${this.SIG !== undefined ? this.SIG.toFixed(4) : 'n/a'}`
            + ' HIS: '
            + `${this.HIS !== undefined ? this.HIS.toFixed(4) : 'n/a'}`;
    }
}

export class MACDIndicator extends SimpleIndicator<MACDCandlestick> {

    protected accessor: IValueAccessor;
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
                         computedArray: FixedSizeArray<MACDCandlestick>): MACDCandlestick {

        const periodFast = this.extsettings.periodFast;
        const periodSlow = this.extsettings.periodSlow;
        const periodSig = this.extsettings.periodSignal;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new MACDCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = this.accessor(source);
        if (value !== undefined) {

            // Compute Slow EMA
            const lastComputedEMAslow = lastComputed !== undefined ? lastComputed.EMAslow : undefined;
            computed.EMAslow = this.ema.compute(periodSlow, sourceItems, this.accessor, undefined, lastComputedEMAslow);

            // Compute Fast EMA
            const lastComputedEMAfast = lastComputed !== undefined ? lastComputed.EMAfast : undefined;
            computed.EMAfast = this.ema.compute(periodFast, sourceItems, this.accessor, undefined, lastComputedEMAfast);

            if (computed.EMAslow !== undefined && computed.EMAfast !== undefined) {

                // Compute MACD line
                computed.MACD = computed.EMAfast - computed.EMAslow;

                // Compute Signal line
                const lastComputedSig = lastComputed !== undefined ? lastComputed.SIG : undefined;
                computed.SIG = this.ema.compute(periodSig, computedArray, c => (<MACDCandlestick>c).MACD, computed, lastComputedSig);

                if (computed.SIG !== undefined) {
                    // Computed Histogram
                    computed.HIS = computed.MACD - computed.SIG;

                    // computed.c = ;
                    // computed.h = computed.c;
                    // computed.l = computed.c;
                }
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
            dispalyName: 'Fast period'
        }));

        group.setSetting('periodSlow', new SettingSet({
            name: 'periodSlow',
            value: this.extsettings.periodSlow.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Slow period'
        }));

        group.setSetting('periodSignal', new SettingSet({
            name: 'periodSignal',
            value: this.extsettings.periodSignal.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Signal period'
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

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#0026FF');
        // MACD
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

        canvas.beginPath();
        canvas.setStrokeStyle('#FF0800');
        // Signal
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

        canvas.beginPath();
        canvas.setStrokeStyle('#399F16');
        // Histogram
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof MACDCandlestick) {
                const c = <MACDCandlestick>item;
                if (c && c.HIS !== undefined) {
                    const value = c.HIS;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
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
