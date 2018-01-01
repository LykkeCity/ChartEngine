/**
 * Correlation Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { TrueRangeExtension } from '../compute/index';
import { ChartPoint, IAxis, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage, IndicatorDataSource } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IdValue, IPoint, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Variance(P) = AVG(P2) - AVG(P) * AVG(P)
// Variance(S) = AVG(S2) - AVG(S) * AVG(S)
// Covariance(P,S) = AVG(P x S) - AVG(P) x AVG(S)
// Correlation(P,S) = Covariance(P,S) / SQRT(Variance(P) x Variance(S))

export class CORCandlestick extends CandlestickExt {

    public p: number|undefined;
    public s: number|undefined;

    public avgp: number|undefined; // avg of p
    public avgs: number|undefined; // avg of s

    public p2: number|undefined; // square of p
    public s2: number|undefined; // square of s

    public avgp2: number|undefined; // avg of p2 
    public avgs2: number|undefined; // avg of s2

    public pxs: number|undefined;
    public avgpxs: number|undefined;

    public toString(precision: number) {
        return `${this.c !== undefined ? this.c.toFixed(precision) : 'n/a'}`;
    }
}

export class CORIndicator extends IndicatorDataSource<CORCandlestick> {

    private ma: IMovingAverageStrategy;
    private extsettings: CORSettings = new CORSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(CORCandlestick, source, context);
        this.name = 'COR';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        const accessor = ValueAccessorFactory.instance.create(this.extsettings.valueType);

        let computedArray: CORCandlestick[] = [];

        const N = this.extsettings.period;
        const sourceItems = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });
        const compareItems = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });
        const computedItems = new FixedSizeArray<CORCandlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });

        // Get compare data souce

        let compareIter: IDataIterator<Candlestick>|undefined;
        if (this.extsettings.uid) {
            const compareDataSource = this.context.register.getItem(this.extsettings.uid);
            if (compareDataSource) {
                compareIter = compareDataSource.getIterator();
            }
        }

        // If can't get compare data source return
        if (!compareIter) {
            return;
        }



        // Get source data without loading
        const sourceIter: IDataIterator<Candlestick> = this.source.getIterator();

        // Select last source items and compare items
        if (arg) {
            if (!sourceIter.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
                throw new Error('Source does not contain updated data');
            }

            //--------------------------------------------------
            const prev: Candlestick[] = [];
            const prevCompare: Candlestick[] = [];
            sourceIter.movePrevWhile((item, counter) => {
                if (counter > N) { return false; }
                if (counter > 0) {
                    prev.push(item);

                    if (compareIter && compareIter.goTo(citem => item.uid.compare(citem.uid) === 0)) {
                        prevCompare.push(compareIter.current);
                    }

                    return true;
                }
                return true; // Skip current item
            });
            prev.reverse();
            prevCompare.reverse();
            //--------------------------------------------------

            //const prev = IndicatorDataSource.getPreviousItems(sourceIter, N - 1);
            sourceItems.pushRange(prev);
            compareItems.pushRange(prevCompare);
        }

        // Get last computed items
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uidOrig.compare(arg.uidFirst) === 0)) {
                computedArray = IndicatorDataSource.getPreviousItems(iter, N - 1);
                computedItems.pushRange(computedArray);
            }
        }

        // Go to first element
        if (arg) {
            sourceIter.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!sourceIter.moveNext()) { return; } // Finish if no data
        }

        // Calculations
        // 

        let found = false;
        const firstUid = sourceIter.current.uid;
        let lastUid;
        do {
            const source = sourceIter.current;
            lastUid = source.uid;
            sourceItems.push(source);

            if (found) {
                found = compareIter.moveTo(citem => source.uid.compare(citem.uid) === 0) !== -1;
            } else {
                found = compareIter.goTo(citem => source.uid.compare(citem.uid) === 0);
            }

            if (!found) {
                continue;
            }

            compareItems.push(found ? compareIter.current : new Candlestick(source.date));

            const computed = this.computeOne(sourceItems, compareItems, computedItems, accessor);

            computedArray.push(computed);
            computedItems.push(computed);
        } while (sourceIter.moveNext());

        // Merge using origUid, not uid
        this.dataStorage.merge(computedArray);

        return new DataChangedArgument(firstUid, lastUid, computedArray.length);
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         compareItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<CORCandlestick>, accessor: IValueAccessor): CORCandlestick {

        const N = this.extsettings.period;

        const source = sourceItems.last();
        const compare = compareItems.lastOrDefault();
        const lastComputed = computedArray.lastOrDefault();

        const p = accessor(source);
        const s = compare ? accessor(compare) : undefined;

        const computed = new CORCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        // Both values should present
        computed.p = (p !== undefined && s !== undefined) ? p : undefined;
        computed.s = (p !== undefined && s !== undefined) ? s : undefined;
        computed.p2 = (p !== undefined && s !== undefined) ? p * p : undefined;
        computed.s2 = (p !== undefined && s !== undefined) ? s * s : undefined;
        computed.pxs = (p !== undefined && s !== undefined) ? p * s : undefined;    // P x S

        // AVG of source
        const lastAvgP = lastComputed !== undefined ? lastComputed.avgp : undefined;
        computed.avgp = this.ma.compute(N, computedArray, item => (<CORCandlestick>item).p, computed, lastAvgP);

        // AVG of compare
        const lastAvgS = lastComputed !== undefined ? lastComputed.avgs : undefined;
        computed.avgs = this.ma.compute(N, computedArray, item => (<CORCandlestick>item).s, computed, lastAvgS);

        // AVG of squared source
        const lastAvgP2 = lastComputed !== undefined ? lastComputed.avgp2 : undefined;
        computed.avgp2 = this.ma.compute(N, computedArray, item => (<CORCandlestick>item).p2, computed, lastAvgP2);

        // AVG of squared compare
        const lastAvgS2 = lastComputed !== undefined ? lastComputed.avgs2 : undefined;
        computed.avgs2 = this.ma.compute(N, computedArray, item => (<CORCandlestick>item).s2, computed, lastAvgS2);

        // Compute P x S average
        const lastAvgPxS = lastComputed !== undefined ? lastComputed.avgpxs : undefined;
        computed.avgpxs = this.ma.compute(N, computedArray, item => (<CORCandlestick>item).pxs, computed, lastAvgPxS);

        // Compute correlation
        if (computed.avgp !== undefined && computed.avgs !== undefined && computed.avgp2 !== undefined && computed.avgs2 !== undefined
            && computed.avgpxs !== undefined) {
            const varianceP = computed.avgp2 - (computed.avgp * computed.avgp);
            const varianceS = computed.avgs2 - (computed.avgs * computed.avgs);
            const covariance = computed.avgpxs - (computed.avgp * computed.avgs);
            if (varianceP !== 0 && varianceS !== 0) {
                const correlation = covariance / Math.sqrt(varianceP * varianceS);

                computed.c = isNaN(correlation) ? undefined : correlation;
                computed.h = computed.c;
                computed.l = computed.c;
            }
        }

        return computed;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: -1, end: 1 };
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.extsettings.period.toString(),
            settingType: SettingType.numeric,
            displayName: 'Period'
        }));

        const sources = this.context.register.list();
        sources.push(new IdValue('', ''));
        group.setSetting('uid', new SettingSet({
            name: 'uid',
            displayName: 'Compare',
            value: this.extsettings.uid,
            settingType: SettingType.select,
            options: sources.map(item => { return { value: item.id, text: item.value }; })
        }));

        group.setSetting('valueType', new SettingSet({
            name: 'valueType',
            displayName: 'Calculate using',
            value: this.extsettings.valueType.toString(),
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
        this.extsettings.period = (period && period.value) ? parseInt(period.value, 10) : this.extsettings.period;

        const uid = value.getSetting('datasource.uid');
        this.extsettings.uid = (uid && uid.value) ? uid.value : this.extsettings.uid;

        const valueType = value.getSetting('datasource.valueType');
        this.extsettings.valueType = (valueType && valueType.value) ? parseInt(valueType.value, 10) : this.extsettings.valueType;

        // recompute
        this.compute();
    }
}

class CORSettings {
    public period: number = 10;
    public uid: string|undefined;
    public valueType: ValueAccessorType = ValueAccessorType.close;
}
