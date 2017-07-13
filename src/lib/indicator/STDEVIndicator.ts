/**
 * Standard Deviation Indicator class.
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

export class STDEVIndicator extends SimpleIndicator<CandlestickExt> {

    private ma: IMovingAverageStrategy;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CandlestickExt, source, context);
        this.name = 'STDEV';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Weight);

        this.settings.period = 10;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>, accessor: IValueAccessor): CandlestickExt {

        const N = this.settings.period;

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new CandlestickExt(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const array = [];
        let sum = 0;
        for (let i = sourceItems.length - 1; i >= 0 && array.length < N ; i -= 1) {
            const value = accessor(sourceItems.getItem(i));
            if (value !== undefined) {
                array.push(value);
                sum += value;
            }
        }

        if (array.length < N || array.length === 0) {
            return computed;
        }

        const avg = sum / array.length;

        const sumSqrtDev = array.reduce((prev, cur) => { return prev + Math.pow(cur - avg, 2); }, 0);

        computed.c = Math.sqrt(sumSqrtDev / array.length);
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

        group.setSetting('valueType', new SettingSet({
            name: 'valueType',
            displayName: 'Calculate using',
            value: this.settings.valueType.toString(),
            settingType: SettingType.select,
            options: [
                { value: ValueAccessorType.close.toString(), text: 'close' },
                { value: ValueAccessorType.open.toString(), text: 'open' },
                { value: ValueAccessorType.high.toString(), text: 'high' },
                { value: ValueAccessorType.low.toString(), text: 'low' },
                { value: ValueAccessorType.hl2.toString(), text: 'hl2' },
                { value: ValueAccessorType.hlc3.toString(), text: 'hlc3' },
                { value: ValueAccessorType.ohlc4.toString(), text: 'ohlc4' },
                { value: ValueAccessorType.hlcc4.toString(), text: 'hlcc4' }
            ]
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        const valueType = value.getSetting('datasource.valueType');
        this.settings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.settings.valueType;

        // recompute
        this.compute();
    }
}
