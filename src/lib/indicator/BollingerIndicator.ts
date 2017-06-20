/**
 * BollingerIndicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage, IndicatorDataSource } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class TripleCandlestick extends Candlestick {
    public top: Candlestick;
    public middle: Candlestick;
    public bottom: Candlestick;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);

        this.top = new Candlestick(date);
        this.middle = new Candlestick(date);
        this.bottom = new Candlestick(date);
    }

    public toString(precision: number) {
        return `${this.top && this.top.c !== undefined ? this.top.c.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.middle && this.middle.c !== undefined ? this.middle.c.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.bottom && this.bottom.c !== undefined ? this.bottom.c.toFixed(precision) : 'n/a'}`;
    }
}

export class BollingerIndicator extends IndicatorDataSource<TripleCandlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(TripleCandlestick, source, context);
        this.name = 'bollinger';
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)
        const accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        const N = 20;
        const K = 2;
        const fsarray = new FixedSizeArray<Candlestick>(N, (lhs, rhs) => { throw new Error('Not implemented.'); });

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

        // Get latest moving average from storage
        let prevMA: number | undefined;
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uid.compare(arg.uidFirst) === 0) && iter.movePrev()) {
                prevMA = iter.current.middle.c;
            }
        }

        // Go to first element
        if (arg) {
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!iterator.moveNext()) { return; } // Finish if no data
        }

        // Calculations
        // 
        const computedArray: TripleCandlestick[] = [];

        const ma = MovingAverageFactory.instance.create(MovingAverageType.Smoothed);

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;
            const source = iterator.current;
            const value = accessor(source);

            const computed = new TripleCandlestick(source.date);
            computed.uid.t = source.uid.t;
            computed.uid.n = source.uid.n;

            fsarray.push(source);

            if (value !== undefined) { // has value
                computed.middle.c = ma.compute(N, fsarray, accessor, undefined, prevMA);
                computed.middle.h = computed.middle.c;
                computed.middle.l = computed.middle.c;

                if (computed.middle.c !== undefined) {
                    // After moving avg is computed, current value can be pushed to array, to calculate std deviation.
                    const standardDeviation = Utils.STDDEV(fsarray, accessor, computed.middle.c);

                    if (standardDeviation !== undefined) {
                        computed.top.c = computed.middle.c + K * standardDeviation;
                        computed.top.h = computed.top.c;
                        computed.top.l = computed.middle.c;

                        computed.bottom.c = computed.middle.c - K * standardDeviation;
                        computed.bottom.h = computed.bottom.c;
                        computed.bottom.l = computed.bottom.c;

                        computed.h = Math.max(computed.top.h, computed.bottom.h,
                                              computed.middle.h !== undefined ? computed.middle.h : Number.NEGATIVE_INFINITY);
                        computed.l = Math.min(computed.top.l, computed.bottom.l, computed.middle.l || Number.POSITIVE_INFINITY, );

                        prevMA = computed.middle.c;
                    }
                }
            }

            computedArray.push(computed);
        } while (iterator.moveNext());

        // Merge
        this.dataStorage.merge(computedArray);

        // Merge new data and notify subscribers
        return new DataChangedArgument(firstUid, lastUid, computedArray.length);
    }
}

export class BollingerIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {


        // Collect charts points
        //
        const top: IPoint[] = [];
        top.length = timeAxis.count; // preallocate memory
        let i = 0;

        RenderUtils.iterate(timeAxis, data, (item, x) => {
            if (item instanceof TripleCandlestick) {
                const t = <TripleCandlestick>item;
                if (t && t.top && t.top.c !== undefined) {
                    const y = yAxis.toX(t.top.c);
                    top[i] = { x: x, y: y };
                    i += 1;
                }
            }
        });

        const bottom: IPoint[] = [];
        bottom.length = timeAxis.count; // preallocate memory
        let j = 0;

        RenderUtils.iterate(timeAxis, data, (item, x) => {
            if (item instanceof TripleCandlestick) {
                const t = <TripleCandlestick>item;
                if (t && t.bottom && t.bottom.c !== undefined) {
                    const y = yAxis.toX(t.bottom.c);
                    bottom[j] = { x: x, y: y };
                    j += 1;
                }
            }
        });

        // Fill area between lines

        canvas.beginPath();
        top.forEach((p, index) => {
            if (p) {
                (index === 0) ? canvas.moveTo(p.x, p.y) : canvas.lineTo(p.x, p.y);
            }
        });

        for (let k = bottom.length - 1; k >= 0; k -= 1) {
            const p = bottom[k];
            if (p) {
                canvas.lineTo(p.x, p.y);
            }
        }

        canvas.closePath();
        canvas.setFillStyle('rgba(0, 100, 150, 0.3)');
        canvas.fill();

        // Lines
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#333333');

        // Middle
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof TripleCandlestick) {
                const triple = <TripleCandlestick>item;
                if (triple.middle && triple.middle.c !== undefined) {
                    const value = triple.middle.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        // Top
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#0400FF');
        top.forEach((p, index) => {
            if (p) {
                (index === 0) ? canvas.moveTo(p.x, p.y) : canvas.lineTo(p.x, p.y);
            }
        });
        canvas.stroke();

        // Bottom
        //
        canvas.beginPath();
        canvas.setStrokeStyle('#0400FF');
        bottom.forEach((p, index) => {
            if (p) {
                (index === 0) ? canvas.moveTo(p.x, p.y) : canvas.lineTo(p.x, p.y);
            }
        });
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
