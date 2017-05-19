/**
 * StochasticOscillator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IIndicator } from './Interfaces';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { Utils } from './Utils';
import { ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class DoubleCandlestick extends Candlestick {
    public fast: Candlestick;
    public slow: Candlestick;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);

        this.fast = new Candlestick(date);
        this.slow = new Candlestick(date);
    }

    public toString() {
        return `${this.fast && this.fast.c !== undefined ? this.fast.c.toFixed(4) : 'n/a'}`
            + ' / '
            + `${this.slow && this.slow.c !== undefined ? this.slow.c.toFixed(4) : 'n/a'}`;
    }
}

export class StochasticOscillator extends IndicatorDataSource<DoubleCandlestick> {

    private settings: StochasticSettings = new StochasticSettings();

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(DoubleCandlestick, source, addInterval);
        this.name = 'stoch';
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        const accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        const N = this.settings.period;
        const fsarray = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });
        const karray = new FixedSizeArray<Candlestick>(N - 1, (lhs, rhs) => { throw new Error('Not implemented.'); });

        // Get source data without loading
        const iterator: IDataIterator<Candlestick> = this.source.getIterator();

        // Select last source values
        if (arg) {
            if (!iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
                throw new Error('Source does not contain updated data');
            }
            const prev = IndicatorDataSource.getPreviousItems(iterator, N - 1);
            fsarray.pushRange(prev);
        }

        // Get last moving average
        let prevMA: number | undefined;
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uid.compare(arg.uidFirst) === 0) && iter.movePrev()) {
                prevMA = iter.current.slow.c;
            }
        }

        // Go to first element
        if (arg) {
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!iterator.moveNext()) { throw new Error('Source does not contain updated data'); }
        }

        // Calculations
        // 
        const computedArray: DoubleCandlestick[] = [];
        const ma = MovingAverageFactory.instance.create(MovingAverageType.Simple);
        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;
            const source = iterator.current;
            const value = accessor(source);
            fsarray.push(source);

            const computed = new DoubleCandlestick(source.date);
            computed.uid.t = source.uid.t;
            computed.uid.n = source.uid.n;

            if (value !== undefined) { // has value
                 // calculating min/max with current value

                const H = <number>fsarray.max(accessor);
                const L = <number>fsarray.min(accessor);
                const K = (L !== H) ? 100 * (value - L) / (H - L) : 100;

                computed.fast.c = K;
                computed.fast.h = K;
                computed.fast.l = K;

                karray.push(computed.fast);

                computed.slow.c = ma.compute(N, karray, candle => candle.c, undefined, prevMA);
                computed.slow.h = computed.slow.c;
                computed.slow.l = computed.slow.c;

                computed.h = Math.max(computed.fast.c, computed.slow.c !== undefined ? computed.slow.c : Number.NEGATIVE_INFINITY);
                computed.l = Math.min(computed.fast.c, computed.slow.c !== undefined ? computed.slow.c : Number.POSITIVE_INFINITY);

                prevMA = computed.slow.c;
            }

            computedArray.push(computed);
        } while (iterator.moveNext());

        // Merge
        this.dataStorage.merge(computedArray);

        // Merge new data and notify subscribers
        return new DataChangedArgument(firstUid, lastUid, computedArray.length);
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

class StochasticSettings {
    public period: number = 20;
    constructor() { }
}

export class StochasticOscillatorRenderer implements IChartRender<Candlestick> {

    constructor() { }

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#00B730');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const double = <DoubleCandlestick>item;
                if (double.fast && double.fast.c !== undefined) {
                    //const x = timeAxis.toX(index);
                    const value = double.fast.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#B50021');
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const double = <DoubleCandlestick>item;
                if (double.slow && double.slow.c !== undefined) {
                    const value = double.slow.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);

        canvas.stroke();
    }

    public testHitArea(
           hitPoint: IPoint,
           data: IDataIterator<Candlestick>,
           frame: IRect,
           timeAxis: ITimeAxis,
           yAxis: IAxis<number>): Candlestick | undefined {
               return undefined;
    }

    public getSettings(): SettingSet {
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }
}

