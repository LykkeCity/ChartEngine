/**
 * Average True Range Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { TrueRangeExtension } from '../compute/index';
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
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// ATR = (ATR prev x (n - 1) + TR) / n

export class ATRIndicator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(CandlestickExt, source, addInterval);
        this.name = 'ATR';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // ADX requires TR
        this.source.addExtension(TrueRangeExtension.uname, new TrueRangeExtension());

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>): CandlestickExt {

            const N = this.settings.period;

            const source = sourceItems.last();
            const lastComputed = computedArray.lastOrDefault();

            const computed = new CandlestickExt(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            // const value = this.accessor(source);
            // if (value !== undefined) {
            const lastComputedValue = lastComputed !== undefined ? lastComputed.c : undefined;
            computed.c = this.ma.compute(N, sourceItems, c => c.ext['tr'], undefined, lastComputedValue);
            computed.h = computed.c;
            computed.l = computed.c;
            //}

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
