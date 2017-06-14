/**
 * Ichimoku Kinko Hyo indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Tenkan-sen (Conversion Line): (9-period high + 9-period low)/2))
// Kijun-sen (Base Line): (26-period high + 26-period low)/2))
// Senkou Span A (Leading Span A): (Conversion Line + Base Line)/2))
// Senkou Span B (Leading Span B): (52-period high + 52-period low)/2))
// Chikou Span (Lagging Span)

export class IKHCandlestick extends CandlestickExt {
    /**
     * Conversion line
     */
    public conversion: number|undefined;

    /**
     * Base Line
     */
    public base: number|undefined;

    /**
     * Leading Span A
     */
    public leadingA: number | undefined;
    public leadingAShifted: number | undefined;

    /**
     * Leading Span B
     */
    public leadingB: number | undefined;
    public leadingBShifted: number | undefined;

    /**
     * Lagging Span
     */
    public lagging: number | undefined;
    public laggingShifted: number|undefined;

    public toString(precision: number) {
        return ''
            + `${this.conversion !== undefined ? this.conversion.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.base !== undefined ? this.base.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.leadingAShifted !== undefined ? this.leadingAShifted.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.leadingBShifted !== undefined ? this.leadingBShifted.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.laggingShifted !== undefined ? this.laggingShifted.toFixed(precision) : 'n/a'}`;
    }
}

export class IKHIndicator extends SimpleIndicator<IKHCandlestick> {

    private ema: IMovingAverageStrategy;
    private extsettings: IKHSettings = new IKHSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(IKHCandlestick, source, context);
        this.name = 'IKH';
    }

    protected get requiredItemsOnCompute(): number {
        return Math.max(this.extsettings.periodConversion, this.extsettings.periodBase, this.extsettings.periodSpanB);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<IKHCandlestick>
                         ): IKHCandlestick {

        const periodConversion = this.extsettings.periodConversion;
        const periodBase = this.extsettings.periodBase;
        const periodSpanB = this.extsettings.periodSpanB;
        const ikhDisplacement = this.extsettings.ikhDisplacement;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = new IKHCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = source.c; //this.accessor(source);
        if (value !== undefined) {

            // computing Conversion Line
            const H1 = sourceItems.max(c => c.h, periodConversion);   // highest high for the period
            const L1 = sourceItems.min(c => c.l, periodConversion);   // lowest low for the period
            if (H1 !== undefined && L1 !== undefined) {

                computed.conversion = (H1 + L1) / 2;
            }

            // computing Base Line
            const H2 = sourceItems.max(c => c.h, periodBase);   // highest high for the period
            const L2 = sourceItems.min(c => c.l, periodBase);   // lowest low for the period
            if (H2 !== undefined && L2 !== undefined) {
                computed.base = (H2 + L2) / 2;
            }

            // computing Leading Span A
            if (computed.base !== undefined && computed.conversion !== undefined) {
                computed.leadingA = (computed.base + computed.conversion) / 2;
            }

            // computing Leading Span B
            const H3 = sourceItems.max(c => c.h, periodSpanB);   // highest high for the period
            const L3 = sourceItems.min(c => c.l, periodSpanB);   // lowest low for the period
            if (H3 !== undefined && L3 !== undefined) {
                computed.leadingB = (H3 + L3) / 2;
            }

            // computing Lagging Span
            computed.lagging = source.c;
        }

        return computed;
    }

    protected afterCompute(arg?: DataChangedArgument) {
        // After compute shift Lagging and Leading lines

        // Leading shifting to right
        this.shiftDataExt(this.extsettings.ikhDisplacement, (dest, source) => {
            if (dest && source) {
                dest.leadingAShifted = source.leadingA;
            } else if (dest) {
                dest.leadingAShifted = undefined;
            }
        });

        // Leading shifting to right
        this.shiftDataExt(this.extsettings.ikhDisplacement, (dest, source) => {
            if (dest && source) {
                dest.leadingBShifted = source.leadingB;
            } else if (dest) {
                dest.leadingBShifted = undefined;
            }
        });

        // Leading shifting to right
        this.shiftDataExt(-this.extsettings.ikhDisplacement, (dest, source) => {
            if (dest && source) {
                dest.laggingShifted = source.lagging;
            } else if (dest) {
                dest.laggingShifted = undefined;
            }
        });
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('periodConversion', new SettingSet({
            name: 'periodConversion',
            value: this.extsettings.periodConversion.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Tenkan-Sen period'
        }));

        group.setSetting('periodBase', new SettingSet({
            name: 'periodBase',
            value: this.extsettings.periodBase.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Kijun-Sen period'
        }));

        group.setSetting('periodSpanB', new SettingSet({
            name: 'periodSpanB',
            value: this.extsettings.periodSpanB.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Senkou Span B period'
        }));

        group.setSetting('ikhDisplacement', new SettingSet({
            name: 'ikhDisplacement',
            value: this.extsettings.ikhDisplacement.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Displacment'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const periodConversion = value.getSetting('datasource.periodConversion');
        this.extsettings.periodConversion = (periodConversion && periodConversion.value) ? parseInt(periodConversion.value, 10) : this.extsettings.periodConversion;

        const periodBase = value.getSetting('datasource.periodBase');
        this.extsettings.periodBase = (periodBase && periodBase.value) ? parseInt(periodBase.value, 10) : this.extsettings.periodBase;

        const periodSpanB = value.getSetting('datasource.periodSpanB');
        this.extsettings.periodSpanB = (periodSpanB && periodSpanB.value) ? parseInt(periodSpanB.value, 10) : this.extsettings.periodSpanB;

        const ikhDisplacement = value.getSetting('datasource.ikhDisplacement');
        this.extsettings.ikhDisplacement = (ikhDisplacement && ikhDisplacement.value) ? parseInt(ikhDisplacement.value, 10) : this.extsettings.ikhDisplacement;

        // recompute
        this.compute();
    }
}

class IKHSettings {
    public periodConversion: number = 9;    // Conversion Line period
    public periodBase: number = 26;     // Base Line period
    public periodSpanB: number = 52;     // Leading Span B period
    public ikhDisplacement: number = 26;
    constructor() { }
}

export class IKHIndicatorRenderer implements IChartRender<Candlestick> {

    constructor() { }

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#267F00');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof IKHCandlestick) {
                const ikh = <IKHCandlestick>item;
                if (ikh.conversion !== undefined) {
                    const value = ikh.conversion;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#D30000');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof IKHCandlestick) {
                const ikh = <IKHCandlestick>item;
                if (ikh.base !== undefined) {
                    const value = ikh.base;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#D30000');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof IKHCandlestick) {
                const ikh = <IKHCandlestick>item;
                if (ikh.leadingAShifted !== undefined) {
                    const value = ikh.leadingAShifted;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#D30000');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof IKHCandlestick) {
                const ikh = <IKHCandlestick>item;
                if (ikh.leadingBShifted !== undefined) {
                    const value = ikh.leadingBShifted;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#267F00');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof IKHCandlestick) {
                const ikh = <IKHCandlestick>item;
                if (ikh.laggingShifted !== undefined) {
                    const value = ikh.laggingShifted;
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
