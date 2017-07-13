/**
 * Weighted Moving Average Indicator class.
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

export class WMAIndicator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CandlestickExt, source, context);
        this.name = 'WMA';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Weight);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>, accessor: IValueAccessor): CandlestickExt {

            const N = this.settings.period;

            const source = sourceItems.last();
            const lastComputed = computedArray.lastOrDefault();

            const computed = new CandlestickExt(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const value = accessor(source);
            if (value !== undefined) {
                const lastComputedValue = lastComputed !== undefined ? lastComputed.c : undefined;
                computed.c = this.ma.compute(N, sourceItems, accessor, undefined, lastComputedValue);
                computed.h = computed.c;
                computed.l = computed.c;
            }

            return computed;
    }
}
