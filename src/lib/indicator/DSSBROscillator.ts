/**
 * Double Smoothed Stochastic oscillator class.
 */
import { ICanvas } from '../canvas/index';
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

// DSS = 100 x (EMAy(EMAx(C-L))) / EMAy(EMAx(H - L))
// DSS(slow) = EMA(DSS)

export class DSSBRCandlestick extends CandlestickExt {
    /**
     * C - Ln
     */
    public CL: number|undefined;

    /**
     * Hn - Ln
     */
    public HL: number|undefined;

    public EMA1ofCL: number | undefined;
    public EMA1ofHL: number | undefined;

    public EMA2ofCL: number | undefined;
    public EMA2ofHL: number | undefined;

    public DSS: number|undefined;

    public DSSslow: number | undefined;

    public toString() {
        return `${this.DSS !== undefined ? this.DSS.toFixed(4) : 'n/a'}`
            + ' / '
            + `${this.DSSslow !== undefined ? this.DSSslow.toFixed(4) : 'n/a'}`;
    }
}

export class DSSBROscillator extends SimpleIndicator<DSSBRCandlestick> {

    private ema: IMovingAverageStrategy;
    private extsettings: DSSBRSettings = new DSSBRSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DSSBRCandlestick, source, context);
        this.name = 'DSSBR';

        this.ema = MovingAverageFactory.instance.create(MovingAverageType.Exponential);
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.periodK, this.extsettings.periodX, this.extsettings.periodZ);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DSSBRCandlestick>
                         ): DSSBRCandlestick {

        const periodK = this.extsettings.periodK;
        const periodX = this.extsettings.periodX;
        const periodZ = this.extsettings.periodZ;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = new DSSBRCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = source.c; //this.accessor(source);
        if (value !== undefined) {

            // calculating min/max with current value
            const H = sourceItems.max(c => c.h, periodK);   // highest high for the period
            const L = sourceItems.min(c => c.l, periodK);   // lowest low for the period

            if (H !== undefined && L !== undefined) {
                computed.CL = value - L;
                computed.HL = H - L;

                // Compute first EMAx
                const lastComputedEMA1cl = lastComputed !== undefined ? lastComputed.EMA1ofCL : undefined;
                computed.EMA1ofCL = this.ema.compute(periodX, sourceItems, c => (<DSSBRCandlestick>c).CL, computed, lastComputedEMA1cl);

                const lastComputedEMA1hl = lastComputed !== undefined ? lastComputed.EMA1ofHL : undefined;
                computed.EMA1ofHL = this.ema.compute(periodX, sourceItems, c => (<DSSBRCandlestick>c).HL, computed, lastComputedEMA1hl);

                // Compute second EMAy
                const lastComputedEMA2cl = lastComputed !== undefined ? lastComputed.EMA2ofCL : undefined;
                computed.EMA2ofCL = this.ema.compute(periodX, sourceItems, c => (<DSSBRCandlestick>c).EMA1ofCL, computed, lastComputedEMA2cl);

                const lastComputedEMA2hl = lastComputed !== undefined ? lastComputed.EMA2ofHL : undefined;
                computed.EMA2ofHL = this.ema.compute(periodX, sourceItems, c => (<DSSBRCandlestick>c).EMA1ofHL, computed, lastComputedEMA2hl);

                if (computed.EMA2ofCL !== undefined && computed.EMA2ofHL !== undefined && computed.EMA2ofHL !== 0) {
                    // Compute DSS
                    computed.DSS = 100 * computed.EMA2ofCL / computed.EMA2ofHL;

                    // Compute DSS slow
                    const lastComputedDSSslow = lastComputed !== undefined ? lastComputed.DSSslow : undefined;
                    computed.DSSslow = this.ema.compute(periodZ, sourceItems, c => (<DSSBRCandlestick>c).DSS, computed, lastComputedDSSslow);
                }
            }
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('periodK', new SettingSet({
            name: 'periodK',
            value: this.extsettings.periodK.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Stochastic period'
        }));

        group.setSetting('periodX', new SettingSet({
            name: 'periodX',
            value: this.extsettings.periodX.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Smoothing period'
        }));

        group.setSetting('periodZ', new SettingSet({
            name: 'periodZ',
            value: this.extsettings.periodZ.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Trigger period'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const periodK = value.getSetting('datasource.periodK');
        this.extsettings.periodK = (periodK && periodK.value) ? parseInt(periodK.value, 10) : this.extsettings.periodK;

        const periodX = value.getSetting('datasource.periodX');
        this.extsettings.periodX = (periodX && periodX.value) ? parseInt(periodX.value, 10) : this.extsettings.periodX;

        const periodZ = value.getSetting('datasource.periodZ');
        this.extsettings.periodZ = (periodZ && periodZ.value) ? parseInt(periodZ.value, 10) : this.extsettings.periodZ;

        // recompute
        this.compute();
    }
}

class DSSBRSettings {
    public periodK: number = 14;    // stochastic period
    public periodX: number = 3;     // smoothing periods
    //public periodY: number = 3;
    public periodZ: number = 3;     // Trigger period
    constructor() { }
}

export class DSSBROscillatorRenderer implements IChartRender<Candlestick> {

    constructor() { }

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#00B730');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DSSBRCandlestick) {
                const double = <DSSBRCandlestick>item;
                if (double.DSS !== undefined) {
                    //const x = timeAxis.toX(index);
                    const value = double.DSS;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#B50021');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DSSBRCandlestick) {
                const double = <DSSBRCandlestick>item;
                if (double.DSSslow !== undefined) {
                    const value = double.DSSslow;
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
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }
}
