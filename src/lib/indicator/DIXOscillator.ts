/**
 * Disparity Index oscillator class.
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
import { IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// DIX = 100 * (close - MA) / MA

export class DIXOscillator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(CandlestickExt, source, addInterval);
        this.name = 'DIX';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>): CandlestickExt {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new CandlestickExt(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = this.accessor(source);
        if (value !== undefined) {
            const lastComputedValue = lastComputed !== undefined ? lastComputed.c : undefined;
            const ma = this.ma.compute(N, sourceItems, this.accessor, undefined, lastComputedValue);
            if (ma !== undefined) {
                computed.c = 100 * (value - ma) / ma;
                computed.h = computed.c;
                computed.l = computed.c;
            }
        }

        return computed;
    }
}
