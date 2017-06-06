/**
 * Typical Price Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
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

export class TPIndicator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CandlestickExt, source, context);
        this.name = 'TP';
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>): CandlestickExt {

        const source = sourceItems.last();

        const computed = new CandlestickExt(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        if (source.h !== undefined && source.l !== undefined && source.c !== undefined) {
            computed.c = (source.h + source.l + source.c) / 3;
            computed.h = computed.c;
            computed.l = computed.c;
        }
        return computed;
    }

    public getSettings(): SettingSet {
        return new SettingSet({ name: 'datasource', group: true });
    }

    public setSettings(value: SettingSet): void {
        // recompute
        this.compute();
    }
}
