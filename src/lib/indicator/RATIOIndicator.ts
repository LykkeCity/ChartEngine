/**
 * Ratiocator Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { TrueRangeExtension } from '../compute/index';
import { ChartPoint, IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IdValue, IRange, IRect } from '../shared/index';
import { DateUtils } from '../utils/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// RATIOCATOR = 100 * (pa/pb) / (A1/B1)

export class RATIOIndicator extends IndicatorDataSource<CandlestickExt> {

    private ma: IMovingAverageStrategy;
    private extsettings: RATIOSettings = new RATIOSettings();
    private accessor: IValueAccessor;
    private base: number|undefined;

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CandlestickExt, source, context);
        this.name = 'RATIO';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);
        this.accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        // Get compare data souce
        const compareDataSource = this.extsettings.uid ? this.context.register.getItem(this.extsettings.uid) : undefined;
        if (!compareDataSource) {
            return;
        }

        const sourceIter = this.source.getIterator();
        const compareIter = compareDataSource.getIterator();

        // Get base value
        if (this.base === undefined) {
            if (this.extsettings.basedate) {
                // load candles on specified date
                const promiseA = this.context.getCandle(this.source.asset, this.extsettings.basedate, this.context.interval());
                const promiseB = this.context.getCandle(compareDataSource.asset, this.extsettings.basedate, this.context.interval());
                Promise.all([promiseA, promiseB]).then(this.handler);
            }
            return;
        }


        // Go to first element
        if (arg) {
            sourceIter.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!sourceIter.moveNext()) { throw new Error('Source does not contain updated data'); }
        }

        // Calculations
        // 

        let found = false;
        const firstUid = sourceIter.current.uid;
        let lastUid;
        const computedArray: CandlestickExt[] = [];
        do {
            const source = sourceIter.current;
            lastUid = source.uid;

            if (found) {
                found = compareIter.moveTo(citem => source.uid.compare(citem.uid) === 0) !== -1;
            } else {
                found = compareIter.goTo(citem => source.uid.compare(citem.uid) === 0);
            }

            if (found) {
                const computed = this.computeOne(source, compareIter.current, this.base);
                computedArray.push(computed);
            }

        } while (sourceIter.moveNext());

        // Merge using origUid, not uid
        this.dataStorage.merge(computedArray);

        const origArg = new DataChangedArgument(firstUid, lastUid, computedArray.length);
        return origArg;
    }

    private handler = (res: [Candlestick, Candlestick]) => {
        const [candleA, candleB] = res;
        // Compute base koefficient and recompute
        const p = this.accessor(candleA);
        const s = this.accessor(candleB);
        if (p !== undefined && s !== undefined && s !== 0) {
            this.base = p / s;
            this.compute();
            this.context.render();
        }
    }

    protected computeOne(sourceItem: Candlestick, compareItem: Candlestick, base: number): CandlestickExt {

        const p = this.accessor(sourceItem);
        const s = this.accessor(compareItem);

        const computed = new CandlestickExt(sourceItem.date);
        computed.uidOrig.t = sourceItem.uid.t;
        computed.uidOrig.n = sourceItem.uid.n;

        if (p !== undefined && s !== undefined && s !== 0 && base !== 0) {
            computed.c = 100 * (p / s) / base;
            computed.h = computed.c;
            computed.l = computed.c;
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('basedate', new SettingSet({
            name: 'basedate',
            dispalyName: 'Base date',
            value: this.extsettings.basedate ? DateUtils.toIsoDate(this.extsettings.basedate) : '',
            settingType: SettingType.date
        }));

        const sources = this.context.register.list();
        sources.push(new IdValue('', ''));
        group.setSetting('uid', new SettingSet({
            name: 'uid',
            dispalyName: 'Compare',
            value: this.extsettings.uid,
            settingType: SettingType.select,
            options: sources.map(item => { return { value: item.id, text: item.value }; })
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {

        const uid = value.getSetting('datasource.uid');
        this.extsettings.uid = (uid && uid.value) ? uid.value : this.extsettings.uid;

        const d = value.getSetting('datasource.basedate');
        this.extsettings.basedate = (d && d.value) ? DateUtils.parseIsoDate(d.value) : undefined;

        // cleare stored base value
        this.base = undefined;

        // recompute
        this.compute();
    }
}

class RATIOSettings {
    public period: number = 10;
    public uid: string|undefined;
    public basedate: Date|undefined;
}
