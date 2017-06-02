/**
 * Correlation Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { TrueRangeExtension } from '../compute/index';
import { ChartPoint, IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
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

// Variance(P) = AVG(P) - AVG(P2)
// Variance(S) = AVG(S) - AVG(S2)
// Covariance(P,S) = AVG(P x S) - AVG(P) x AVG(S)
// Correlation(P,S) = Covariance(P,S) / SQRT(Variance(P) x Variance(S))

export class CORCandlestick extends CandlestickExt {

    public p: number|undefined;
    public s: number|undefined;

    public p2: number|undefined;
    public s2: number|undefined;

    public pxs: number|undefined;

    public toString() {
        return `${this.c !== undefined ? this.c.toFixed(4) : 'n/a'}`;
    }
}

export class CORIndicator extends SimpleIndicator<CORCandlestick> {

    private ma: IMovingAverageStrategy;
    private extsettings: CORSettings = new CORSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CORCandlestick, source, context);
        this.name = 'COR';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);

        // Set default settings
        this.settings.period = 10;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CORCandlestick>): CORCandlestick {

        const N = this.settings.period;
        const multiplier = this.extsettings.multiplier;

        const current = sourceItems.last();
        const prev = sourceItems.length > 1 ? sourceItems.getItem(sourceItems.length - 1) : undefined;
        const lastComputed = computedArray.lastOrDefault();

        const computed = new CORCandlestick(current.date);
        computed.uidOrig.t = current.uid.t;
        computed.uidOrig.n = current.uid.n;

        // // Build ATR
        // const lastComputedValue = lastComputed !== undefined ? lastComputed.ATR : undefined;
        // computed.ATR = this.ma.compute(N, sourceItems, c => c.ext['tr'], undefined, lastComputedValue);

        // if (current.c !== undefined && current.h !== undefined && current.l !== undefined && computed.ATR !== undefined) {



        //     computed.h = computed.c;
        //     computed.l = computed.c;
        // }

        computed.c = 1;
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

class CORSettings {
    public multiplier: number = 3;
}
