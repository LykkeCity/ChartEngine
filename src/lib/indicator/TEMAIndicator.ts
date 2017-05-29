/**
 * Triple Exponential Moving Average Indicator class.
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

export class TEMACandlestick extends CandlestickExt {
    public EMA: number | undefined;
    public DEMA: number | undefined;
    public TEMA: number | undefined;
}

export class TEMAIndicator extends SimpleIndicator<TEMACandlestick> {

    private ema: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(TEMACandlestick, source, context);
        this.name = 'TEMA';

        this.ema = MovingAverageFactory.instance.create(MovingAverageType.Exponential);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<TEMACandlestick>
                         ): TEMACandlestick {

            const N = this.settings.period;

            const source = sourceItems.last(); // source must contain at least one item.
            const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

            const computed = new TEMACandlestick(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const value = this.accessor(source);
            if (value !== undefined) {

                const lastComputedEMA = lastComputed !== undefined ? lastComputed.EMA : undefined;

                // 1. Compute EMA
                computed.EMA = this.ema.compute(N, sourceItems, this.accessor, undefined, lastComputedEMA);

                if (computed.EMA !== undefined) {
                    // 2. Compute DEMA. On base of computed EMA
                    const lastComputedDEMA = lastComputed !== undefined ? lastComputed.DEMA : undefined;

                    // Adding last computed EMA to calculate DEMA
                    computed.DEMA = this.ema.compute(N, computedArray, item => (<TEMACandlestick>item).EMA, computed, lastComputedDEMA);
                    if (computed.DEMA !== undefined) {

                        // 3. Compute TEMA. On base of computed DEMA
                        const lastComputedTEMA = lastComputed !== undefined ? lastComputed.TEMA : undefined;

                        computed.TEMA = this.ema.compute(N, computedArray, item => (<TEMACandlestick>item).DEMA, computed, lastComputedTEMA);

                        if (computed.TEMA !== undefined) {
                            computed.c = 3 * computed.EMA - 3 * computed.DEMA + computed.TEMA;
                            computed.h = computed.c;
                            computed.l = computed.c;
                        }
                    }
                }
            }

            return computed;
    }
}
