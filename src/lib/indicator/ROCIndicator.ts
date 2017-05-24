/**
 * Rate of Change Indicator class.
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
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Roc = 100 x ( Close[t] - Close[t-N] ) / Close[t-N] 

export class ROCIndicator extends SimpleIndicator<CandlestickExt> {

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(CandlestickExt, source, addInterval);
        this.name = 'ROC';

        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);
    }

    protected get requiredItemsOnCompute(): number {
        return this.settings.period + 1; // ROC requires one extra item
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CandlestickExt>): CandlestickExt {

        const N = this.settings.period;
        const L = sourceItems.length;

        const source = sourceItems.last();

        const computed = new CandlestickExt(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const i = L - (N + 1);
        if (i >= 0 && i < sourceItems.length) {
            const prev = sourceItems.getItem(i);

            const curValue = this.accessor(source);
            const prevValue = this.accessor(prev);

            if (curValue !== undefined && prevValue !== undefined) {
                computed.c = 100 * (curValue - prevValue) / prevValue;
                computed.h = computed.c;
                computed.l = computed.c;
            }
        }
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
