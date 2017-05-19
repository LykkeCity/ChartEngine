/**
 * Average Directional Index Indicator class.
 */
import { ICanvas } from '../canvas/index';
import {
    MinusDirectionalMovementExtension,
    PlusDirectionalMovementExtension,
    TrueRangeExtension } from '../compute/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class ADXCandlestick extends CandlestickExt {
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

    public DX: number | undefined;
}

export class ADXIndicator extends SimpleIndicator<ADXCandlestick> {

    private adxma: IMovingAverageStrategy;
    private wma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(ADXCandlestick, source, addInterval);
        this.name = 'ADX';

        this.wma = MovingAverageFactory.instance.create(MovingAverageType.Wilder);
        this.adxma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // ADX requires TR, +DM, -DM
        this.source.addExtension(TrueRangeExtension.uname, new TrueRangeExtension());
        this.source.addExtension(PlusDirectionalMovementExtension.uname, new PlusDirectionalMovementExtension());
        this.source.addExtension(MinusDirectionalMovementExtension.uname, new MinusDirectionalMovementExtension());

        // Set default settings
        this.settings.period = 14;

        // Build initial data set
        this.compute();
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         accessor: (candle: Candlestick) => number|undefined,
                         computedArray: FixedSizeArray<ADXCandlestick>): ADXCandlestick {

            const N = this.settings.period;

            const source = sourceItems.last();
            const lastComputed = computedArray.lastOrDefault();

            const computed = new ADXCandlestick(source.date);
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

                    // Compute DX
                    computed.DX = 100 * Math.abs(pDI - mDI) / (pDI + mDI);

                    // Computed ADX
                    const lastComputedADX = lastComputed !== undefined ? lastComputed.c : undefined;
                    computed.c = this.adxma.compute(N, computedArray, item => (<ADXCandlestick>item).DX, computed, lastComputedADX);
                    computed.h = computed.c;
                    computed.l = computed.c;
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
