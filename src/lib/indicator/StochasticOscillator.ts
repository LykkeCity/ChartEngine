/**
 * StochasticOscillator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { ChartRenderer, IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Fast %K = 100 x (C-L) / (H-L) // highest high, lowest low
// Fast %D = SMA (Fast %K, 3)
//
// Slow %K = SMA (Fast %K, 3)
// Slow %D = SMA (Slow %K, 3)

export class DoubleCandlestick extends CandlestickExt {
    public fastK: number|undefined;
    public fastD: number|undefined;
    public K: number|undefined;
    public D: number|undefined;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);
    }

    public toString(precision: number) {
        return `${this.K !== undefined ? this.K.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.D !== undefined ? this.D.toFixed(precision) : 'n/a'}`;
    }
}

export class FastStochasticOscillator extends SimpleIndicator<DoubleCandlestick> {

    private ma: IMovingAverageStrategy;
    private extsettings: FastStochasticSettings = new FastStochasticSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'FSTOC';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // Default settings
        this.extsettings.periodK = 14;
        this.extsettings.periodD = 3;
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.periodK, this.extsettings.periodD);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>, accessor: IValueAccessor): DoubleCandlestick {

        const N = this.settings.period;
        const periodK = this.extsettings.periodK;
        const periodD = this.extsettings.periodD;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = computeFastK(sourceItems, periodK);

        const value = source.c; // this.accessor(source);
        if (value !== undefined) {

            // TODO: Slow %K should start computing only when there is enough values. Not from the start

            const lastComputedFastK = lastComputed !== undefined ? lastComputed.K : undefined;
            computed.fastD = this.ma.compute(periodD, computedArray, c => (<DoubleCandlestick>c).fastK, computed, lastComputedFastK);

            computed.K = computed.fastK;
            computed.D = computed.fastD;

            // computed.c = undefined;
            // computed.h = computed.c;
            // computed.l = computed.c;
        }

        return computed;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: 0, end: 100 };
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('periodK', new SettingSet({
            name: 'periodK',
            value: this.extsettings.periodK.toString(),
            settingType: SettingType.numeric,
            displayName: '%K period'
        }));

        group.setSetting('periodD', new SettingSet({
            name: 'periodD',
            value: this.extsettings.periodD.toString(),
            settingType: SettingType.numeric,
            displayName: '%D period'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const periodK = value.getSetting('datasource.periodK');
        this.extsettings.periodK = (periodK && periodK.value) ? parseInt(periodK.value, 10) : this.extsettings.periodK;

        const periodD = value.getSetting('datasource.period');
        this.extsettings.periodD = (periodD && periodD.value) ? parseInt(periodD.value, 10) : this.extsettings.periodD;

        // recompute
        this.compute();
    }
}

export class SlowStochasticOscillator extends SimpleIndicator<DoubleCandlestick> {

    private ma: IMovingAverageStrategy;
    private extsettings: SlowStochasticSettings = new SlowStochasticSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'SSTOC';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // Default settings
        this.extsettings.periodK = 14;
        this.extsettings.periodD = 3;
        this.extsettings.period2D = 3;
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.periodK, this.extsettings.periodD, this.extsettings.period2D);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>, accessor: IValueAccessor): DoubleCandlestick {

        const N = this.settings.period;
        const periodK = this.extsettings.periodK;
        const periodD = this.extsettings.periodD;
        const period2D = this.extsettings.period2D;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = computeFastK(sourceItems, periodK);

        const value = source.c; // this.accessor(source);
        if (value !== undefined) {

            // TODO: Slow %K should start computing only when there is enough values. Not from the start

            const lastComputedSlowK = lastComputed !== undefined ? lastComputed.K : undefined;
            computed.K = this.ma.compute(periodD, computedArray, c => (<DoubleCandlestick>c).fastK, computed, lastComputedSlowK);

            const lastComputedSlowD = lastComputed !== undefined ? lastComputed.D : undefined;
            computed.D = this.ma.compute(period2D, computedArray, c => (<DoubleCandlestick>c).K, computed, lastComputedSlowD);

            // computed.c = undefined;
            // computed.h = computed.c;
            // computed.l = computed.c;
        }

        return computed;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: 0, end: 100 };
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('periodK', new SettingSet({
            name: 'periodK',
            value: this.extsettings.periodK.toString(),
            settingType: SettingType.numeric,
            displayName: '%K period'
        }));

        group.setSetting('periodD', new SettingSet({
            name: 'periodD',
            value: this.extsettings.periodD.toString(),
            settingType: SettingType.numeric,
            displayName: '%D period'
        }));

        group.setSetting('period2D', new SettingSet({
            name: 'period2D',
            value: this.extsettings.period2D.toString(),
            settingType: SettingType.numeric,
            displayName: '2nd %D period'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const periodK = value.getSetting('datasource.periodK');
        this.extsettings.periodK = (periodK && periodK.value) ? parseInt(periodK.value, 10) : this.extsettings.periodK;

        const periodD = value.getSetting('datasource.period');
        this.extsettings.periodD = (periodD && periodD.value) ? parseInt(periodD.value, 10) : this.extsettings.periodD;

        const period2D = value.getSetting('datasource.period');
        this.extsettings.period2D = (period2D && period2D.value) ? parseInt(period2D.value, 10) : this.extsettings.period2D;

        // recompute
        this.compute();
    }
}

export class OBOSOscillator extends SimpleIndicator<DoubleCandlestick> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'OBOS';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // Default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>, accessor: IValueAccessor): DoubleCandlestick {

        const periodK = this.settings.period;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = computeFastK(sourceItems, periodK);

        if (computed.fastK !== undefined) {
            computed.c = computed.fastK;
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
            displayName: 'Period'
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

class FastStochasticSettings {
    public periodK: number = 14;
    public periodD: number = 3;
    constructor() { }
}

class SlowStochasticSettings {
    public periodK: number = 14;
    public periodD: number = 3;
    public period2D: number = 3;
    constructor() { }
}

export class StochasticOscillatorRenderer extends ChartRenderer implements IChartRender<Candlestick> {

    constructor() {
        super();
    }

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        const overlapfill = this.settings.zone.overlapfill;
        const upthreshold = this.settings.zone.upthreshold;
        const lowthreshold = this.settings.zone.lowthreshold;

        const upper = yAxis.toX(upthreshold);
        const lower = yAxis.toX(lowthreshold);

        // Collect charts points
        //
        const K: IPoint[] = [];
        K.length = timeAxis.count; // preallocate memory
        let i = 0;

        RenderUtils.iterate(timeAxis, data, (item, x) => {
            if (item instanceof DoubleCandlestick) {
                const d = <DoubleCandlestick>item;
                if (d && d.K !== undefined) {
                    const y = yAxis.toX(d.K);
                    K[i] = { x: x, y: y };
                    i += 1;
                }
            }
        });
        K.length = i;

        if (overlapfill && K.length > 1) {
            RenderUtils.fillOverlap(canvas, K, upper, true, 'green');
            RenderUtils.fillOverlap(canvas, K, lower, false, 'red');
        }

        canvas.beginPath();
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const double = <DoubleCandlestick>item;
                if (double.K !== undefined) {
                    return { uid: item.uid, v: double.K };
                }
            }
        }, frame, timeAxis, yAxis);

        canvas.setStrokeStyle('#00B730');
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#B50021');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const double = <DoubleCandlestick>item;
                if (double.D !== undefined) {
                    const value = double.D;
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
        const zone = super.getZonesSettings();

        const visual = new SettingSet('visual');
        visual.setSetting('zones', zone);
        return visual;
    }

    public setSettings(settings: SettingSet): void {
        const zone = settings.getSetting('visual.zones');
        if (zone) {
            super.setZonesSettings(zone);
        }
    }
}

function computeFastK(sourceItems: FixedSizeArray<Candlestick>, periodK: number): DoubleCandlestick {

    const source = sourceItems.last(); // source must contain at least one item.

    const computed = new DoubleCandlestick(source.date);
    computed.uidOrig.t = source.uid.t;
    computed.uidOrig.n = source.uid.n;

    const value = source.c; // accessor(source)
    if (value !== undefined) {

        // calculating min/max with current value
        const H = sourceItems.max(c => c.h, periodK);   // highest high for the period
        const L = sourceItems.min(c => c.l, periodK);   // lowest low for the period

        if (H !== undefined && L !== undefined) {
            computed.fastK = (L !== H) ? 100 * (value - L) / (H - L) : 100; // fast %K
        }
    }

    return computed;
}
