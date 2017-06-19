/**
 * Average Directional Index Indicator class.
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
import { DMICandlestick, DMIIndicator } from './DMIIndicator';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// export class ADXCandlestick extends CandlestickExt {
//     /** 
//      * Smoothed TR
//      */
//     public TRA: number | undefined;
//     /**
//      * Smoothed +DM
//      */
//     public pDMA: number | undefined;
//     /**
//      * Smoothed -DM
//      */
//     public mDMA: number | undefined;

//     public DX: number | undefined;
// }

export class ADXCandlestick extends DMICandlestick {
    public DX: number | undefined;

    public toString(precision: number) {
        return 'ADX: '
            + `${this.c !== undefined ? this.c.toFixed(precision) : 'n/a'}`;
    }
}

export class ADXIndicator extends DMIIndicator {

    private adxma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(source, context);
        this.name = 'ADX';

        this.adxma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // ADX requires TR, +DM, -DM
        this.source.addExtension(TrueRangeExtension.uname, new TrueRangeExtension());
        this.source.addExtension(UpDirectionalMovementExtension.uname, new UpDirectionalMovementExtension());
        this.source.addExtension(DownDirectionalMovementExtension.uname, new DownDirectionalMovementExtension());

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<ADXCandlestick>, accessor: IValueAccessor): ADXCandlestick {

            const N = this.settings.period;

            const lastComputed = computedArray.lastOrDefault();

            const computedDMI = super.computeOne(sourceItems, computedArray, accessor);

            // Copy values from computed DMI
            const computed = new ADXCandlestick(computedDMI.date);
            computed.uidOrig.t = computedDMI.uid.t;
            computed.uidOrig.n = computedDMI.uid.n;

            computed.TRA = computedDMI.TRA;
            computed.pDMA = computedDMI.pDMA;
            computed.mDMA = computedDMI.mDMA;
            computed.DX = computedDMI.c;

            // Compute ADX
            const lastComputedADX = lastComputed !== undefined ? lastComputed.c : undefined;
            computed.c = this.adxma.compute(N, computedArray, item => (<ADXCandlestick>item).DX, computed, lastComputedADX);
            computed.h = computed.c;
            computed.l = computed.c;

            return computed;
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
