/**
 * Directional Movement Index Indicator class.
 */
import { ICanvas } from '../canvas/index';
import {
    DownDirectionalMovementExtension,
    UpDirectionalMovementExtension,
    TrueRangeExtension } from '../compute/index';
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

export class DMICandlestick extends CandlestickExt {
    /** 
     * Smoothed TR
     */
    public TRA: number | undefined;
    /**
     * Smoothed +DM
     */
    public pDMA: number | undefined;
    /**
     * Smoothed -DM
     */
    public mDMA: number | undefined;

    /**
     * Smoothed +DI
     */
    public pDI: number | undefined;
    /**
     * Smoothed -DI
     */
    public mDI: number | undefined;

    public toString(precision: number) {
        return 'DX: '
            + `${this.c !== undefined ? this.c.toFixed(precision) : 'n/a'}`
            + ' +DI: '
            + `${this.pDI !== undefined ? this.pDI.toFixed(precision) : 'n/a'}`
            + ' -DI '
            + `${this.mDI !== undefined ? this.mDI.toFixed(precision) : 'n/a'}`;
    }
}

export class DMIIndicator extends SimpleIndicator<DMICandlestick> {

    protected wma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DMICandlestick, source, context);
        this.name = 'DMI';

        this.wma = MovingAverageFactory.instance.create(MovingAverageType.Wilder);
        //this.adxma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // DMI requires TR, +DM, -DM
        this.source.addExtension(TrueRangeExtension.uname, new TrueRangeExtension());
        this.source.addExtension(UpDirectionalMovementExtension.uname, new UpDirectionalMovementExtension());
        this.source.addExtension(DownDirectionalMovementExtension.uname, new DownDirectionalMovementExtension());

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DMICandlestick>, accessor: IValueAccessor): DMICandlestick {

            const N = this.settings.period;

            const source = sourceItems.last();
            const lastComputed = computedArray.lastOrDefault();

            const computed = new DMICandlestick(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const value = accessor(source);
            if (value !== undefined) {

                // Using Wilder for smoothing +DM, -DM, TR
                //
                const lastComputedPDMA = lastComputed !== undefined ? lastComputed.ext['pdm'] : undefined;
                computed.pDMA = this.wma.compute(N, sourceItems, item => item.ext['pdm'], undefined, lastComputedPDMA);

                const lastComputedMDMA = lastComputed !== undefined ? lastComputed.ext['mdm'] : undefined;
                computed.mDMA = this.wma.compute(N, sourceItems, item => item.ext['mdm'], undefined, lastComputedMDMA);

                const lastComputedTRA = lastComputed !== undefined ? lastComputed.ext['tr'] : undefined;
                computed.TRA = this.wma.compute(N, sourceItems, item => item.ext['tr'], undefined, lastComputedTRA);

                if (computed.pDMA !== undefined && computed.mDMA !== undefined && computed.TRA !== undefined) {
                    // Compute smoothed +DI, -DI
                    const pDI = (computed.pDMA / computed.TRA) * 100;
                    const mDI = (computed.mDMA / computed.TRA) * 100;
                    computed.pDI = pDI;
                    computed.mDI = mDI;

                    // Compute DX
                    computed.c = 100 * Math.abs(pDI - mDI) / (pDI + mDI);
                    computed.h = computed.c;
                    computed.l = computed.c;
                }
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

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        // recompute
        this.compute();
    }
}

export class DMIIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#0026FF');
        // Jaw
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DMICandlestick) {
                const dmi = <DMICandlestick>item;
                if (dmi && dmi.c !== undefined) {
                    const value = dmi.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#FF0800');
        // Teeth
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DMICandlestick) {
                const dmi = <DMICandlestick>item;
                if (dmi && dmi.mDI !== undefined) {
                    const value = dmi.mDI;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#399F16');
        // Lips
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DMICandlestick) {
                const dmi = <DMICandlestick>item;
                if (dmi && dmi.pDI !== undefined) {
                    const value = dmi.pDI;
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
