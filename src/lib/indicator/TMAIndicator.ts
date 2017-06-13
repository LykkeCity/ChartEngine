/**
 * Triangular Moving Average Indicator class.
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

export class TMACandlestick extends CandlestickExt {
    public SMA: number | undefined;
}

export class TMAIndicator extends SimpleIndicator<TMACandlestick> {

    private sma: IMovingAverageStrategy;
    private tma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(TMACandlestick, source, context);
        this.name = 'TMA';

        this.sma = MovingAverageFactory.instance.create(MovingAverageType.Simple);
        this.tma = MovingAverageFactory.instance.create(MovingAverageType.Triangular);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<TMACandlestick>
                         ): TMACandlestick {

            const N = this.settings.period;

            const source = sourceItems.last(); // source must contain at least one item.
            const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

            const computed = new TMACandlestick(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const value = this.accessor(source);
            if (value !== undefined) {

                const lastComputedSMA = lastComputed !== undefined ? lastComputed.SMA : undefined;

                // 1. Compute SMA
                computed.SMA = this.sma.compute(N, sourceItems, this.accessor, undefined, lastComputedSMA);

                if (computed.SMA !== undefined) {
                    // 2. Compute TMA. On base of computed TMA

                    const lastComputedTMA = lastComputed !== undefined ? lastComputed.c : undefined;

                    // Adding last computed EMA to calculate DEMA
                    const TMA = this.tma.compute(N, computedArray, item => (<TMACandlestick>item).SMA, computed, lastComputedTMA);
                    if (TMA !== undefined) {
                        computed.c = TMA;
                        computed.h = computed.c;
                        computed.l = computed.c;
                    }
                }
            }

            return computed;
    }
}
