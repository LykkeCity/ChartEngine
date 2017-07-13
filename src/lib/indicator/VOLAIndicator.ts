/**
 * Historic Volatility Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { LogReturnExtension } from '../compute/index';
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

// Ri = Log (Pi / P(i-1))
// Avg = SUM(Ri) / n     or moving average
// SSD = SUM (Ri - Avg)
// HV = SQRT(SSD / (n - 1)) * SQRT(TP)
// 
// TP is
// Monthly - 12
// Weekly -  52
// Daily - 252
// Intraday - 252 * bars per day

export class RSICandlestick extends CandlestickExt {
    public MA: number | undefined;
}

export class VOLAIndicator extends SimpleIndicator<RSICandlestick> {

    private ma: IMovingAverageStrategy;
    private ext: LogReturnExtension;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(RSICandlestick, source, context);
        this.name = 'VOLA';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // VOLA requires "Return"
        this.initExtension();
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<RSICandlestick>, accessor: IValueAccessor): RSICandlestick {

        const N = this.settings.period;

        const source = sourceItems.last(); // source must contain at least one item.
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = new RSICandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const ext = this.ext;

        // Compute moving average
        const lastComputedMA = lastComputed !== undefined ? lastComputed.MA : undefined;
        computed.MA = this.ma.compute(N, sourceItems, candle => ext.value(candle), undefined, lastComputedMA);

        // Compute diverse
        if (computed.MA !== undefined) {
            const avg = computed.MA;
            const SSD = sourceItems.sum(item => {
                const ret = ext.value(item);
                return (ret !== undefined) ? Math.abs(ret - avg) : 0;
            }, N);

            const interval = this.getTPByInterval(this.context.interval());

            if (SSD !== undefined && N > 1) {
                // Compute HV
                computed.c = SSD !== 0 ? Math.sqrt(SSD / (N - 1)) * Math.sqrt(interval) : 0;
                computed.h = computed.c;
                computed.l = computed.c;
            }
        }
        return computed;
    }

    /**
     * Returns Trading Period
     * @param interval 
     */
    private getTPByInterval(interval: TimeInterval): number {
        switch (interval) {
            case TimeInterval.month: return 12;
            case TimeInterval.week: return 52;
            case TimeInterval.day10: return 25;
            case TimeInterval.day: return 252;
            case TimeInterval.hour12: return 252 * 2;
            case TimeInterval.hour6: return 252 * 4;
            case TimeInterval.hour4: return 252 * 6;
            case TimeInterval.hour: return 252 * 24;
            case TimeInterval.min30: return 252 * 24 * 2;
            case TimeInterval.min15: return 252 * 24 * 4;
            case TimeInterval.min5: return 252 * 24 * 12;
            case TimeInterval.min: return 252 * 24 * 60;
            case TimeInterval.sec: return 252 * 24 * 60 * 60;
            default:
            throw new Error(`Unexpected time interval ${interval}`);
        }
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

        // re-init extension with new value type
        this.initExtension();

        // recompute
        this.compute();
    }

    private initExtension() {
        // remove old extension and add new one
        //
        if (this.ext) {
            this.source.removeExtension(this.ext.uname);
        }

        const accessor = ValueAccessorFactory.instance.create(this.settings.valueType);
        this.ext = new LogReturnExtension(accessor);
        this.source.addExtension(this.ext.uname, this.ext);
    }
}
