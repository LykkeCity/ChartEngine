/**
 * Double Exponential Moving Average Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IPoint, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class DEMACandlestick extends CandlestickExt {
    public EMA: number | undefined;
    public DEMA: number | undefined;
}

export class DEMAIndicator extends SimpleIndicator<DEMACandlestick> {

    private ema: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DEMACandlestick, source, context);
        this.name = 'DEMA';

        this.ema = MovingAverageFactory.instance.create(MovingAverageType.Exponential);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DEMACandlestick>, accessor: IValueAccessor): DEMACandlestick {

            const N = this.settings.period;

            const source = sourceItems.last(); // source must contain at least one item.
            const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

            const computed = new DEMACandlestick(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const value = accessor(source);
            if (value !== undefined) {

                const lastComputedEMA = lastComputed !== undefined ? lastComputed.EMA : undefined;

                // 1. Compute EMA
                computed.EMA = this.ema.compute(N, sourceItems, accessor, undefined, lastComputedEMA);

                if (computed.EMA !== undefined) {
                    // 2. Compute DEMA. On base of computed EMA

                    const lastComputedDEMA = lastComputed !== undefined ? lastComputed.DEMA : undefined;

                    // Adding last computed EMA to calculate DEMA
                    computed.DEMA = this.ema.compute(N, computedArray, item => (<DEMACandlestick>item).EMA, computed, lastComputedDEMA);
                    if (computed.DEMA !== undefined) {
                        computed.c = 2 * computed.EMA - computed.DEMA;
                        computed.h = computed.c;
                        computed.l = computed.c;
                    }
                }
            }

            return computed;
    }
}
