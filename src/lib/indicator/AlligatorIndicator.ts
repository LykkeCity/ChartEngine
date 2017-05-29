/**
 * AlligatorIndicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IContext, IIndicator } from './Interfaces';
import { MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class TripleCandlestick extends Candlestick {
    public jaw: Candlestick;
    public teeth: Candlestick;
    public lips: Candlestick;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);

        this.jaw = new Candlestick(date);
        this.teeth = new Candlestick(date);
        this.lips = new Candlestick(date);
    }

    public toString() {
        return `${this.jaw && this.jaw.c !== undefined ? this.jaw.c.toFixed(4) : 'n/a'}`
            + ' / '
            + `${this.teeth && this.teeth.c !== undefined ? this.teeth.c.toFixed(4) : 'n/a'}`
            + ' / '
            + `${this.lips && this.lips.c !== undefined ? this.lips.c.toFixed(4) : 'n/a'}`;
    }
}

export class AlligatorIndicator extends IndicatorDataSource<TripleCandlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(TripleCandlestick, source, context);
        this.name = 'alligator';
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the unde (update data from current place to end)
        // Generate future time when shift indicator values
        const accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

        const N = 13;

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

        let prevJaw: number | undefined;
        let prevTeeth: number | undefined;
        let prevLips: number | undefined;
        // Get latest moving average from storage. As result will be shifted the last MA we are taking is also shifted.
        if (arg) {
            const iter = this.dataStorage.getIterator();
            if (iter.goTo(item => item.uid.compare(arg.uidFirst) === 0)) {
                if (iter.moveTimes(3) === 3) {  // total move = 5
                    prevLips = iter.current.lips.c;

                    if (iter.moveTimes(2) === 2) {  // total move = 5
                        prevTeeth = iter.current.teeth.c;

                        if (iter.moveTimes(3) === 3) {  // total move = 8
                            prevJaw = iter.current.jaw.c;
                        }
                    }
                }
            }
        }

        // Go to first element
        if (arg) {
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!iterator.moveNext()) { throw new Error('Source does not contain updated data'); }
        }

        // Calculations
        // generate jaw: array[]
        // generate teeth: array[]
        // generate lips: array[]
        // 
        const jaw: Candlestick[] = [];
        const teeth: Candlestick[] = [];
        const lips: Candlestick[] = [];

        const ma = MovingAverageFactory.instance.create(MovingAverageType.Smoothed);

        const firstUid = iterator.current.uid;
        let lastUid;
        do {
            lastUid = iterator.current.uid;

            const source = iterator.current;
            fsarray.push(source);
            const j = new Candlestick(source.date);
            j.uid.t = source.uid.t;
            j.uid.n = source.uid.n;
            const t = new Candlestick(source.date);
            t.uid.t = source.uid.t;
            t.uid.n = source.uid.n;
            const l = new Candlestick(source.date);
            l.uid.t = source.uid.t;
            l.uid.n = source.uid.n;

            if (source.c !== undefined) {
                j.c = ma.compute(13, fsarray, accessor, undefined, prevJaw);  prevJaw = j.c;
                t.c = ma.compute(8, fsarray, accessor, undefined, prevTeeth); prevTeeth = t.c;
                l.c = ma.compute(5, fsarray, accessor, undefined, prevLips);  prevLips = l.c;

                j.h = j.c;
                j.l = j.c;
                t.h = t.c;
                t.l = t.c;
                l.h = l.c;
                l.l = l.c;
            }

            jaw.push(j);
            teeth.push(t);
            lips.push(l);

        } while (iterator.moveNext());

        // Shift all / Shift UID AND TIME. Merging will be done with UID, so UID should stay on the same place.
        // ... Add X bars in the future
        // ... copy data to right
        // ... 
        // jaw shift by 8 bars  
        // teeth shift by 5 bars
        // lips shift by 3 bars

        // Make fake candles on the right side.
        let lastDate = jaw[jaw.length - 1].date;
        for (let i = 0; i < 8; i += 1) {
            lastDate = this.addInterval(lastDate, 1);
            const fake = new Candlestick(lastDate);
            //fake.uid.t = lastDate.getTime().toString();
            jaw.push(fake);
        }
        lastDate = teeth[teeth.length - 1].date;
        for (let i = 0; i < 5; i += 1) {
            lastDate = this.addInterval(lastDate, 1);
            const fake = new Candlestick(lastDate);
            //fake.uid = lastDate.getTime().toString();
            teeth.push(fake);
        }
        lastDate = lips[lips.length - 1].date;
        for (let i = 0; i < 3; i += 1) {
            lastDate = this.addInterval(lastDate, 1);
            const fake = new Candlestick(lastDate);
            //fake.uid = lastDate.getTime().toString();
            lips.push(fake);
        }

        // Shift values

        this.shift(jaw, 8);
        this.shift(teeth, 5);
        this.shift(lips, 3);

        // Remove first items as they are empty
        jaw.splice(0, 8);
        teeth.splice(0, 5);
        lips.splice(0, 3);

        // merge all 3 to one. Custom merge one by one, not all 3 together. Because of their different relative shift.
        this.mergeLine(jaw, 0);
        this.mergeLine(teeth, 1);
        this.mergeLine(lips, 2);

        // Merge new data and notify subscribers
        return new DataChangedArgument(firstUid, lastUid, jaw.length);
    }

    private mergeLine(array: Candlestick[], line: number) {
        // Prepare TripleCandlestick array
        const triple = [];
        for (const item of array) {
            const t = new TripleCandlestick(item.date);
            switch (line) {
                case 0: t.jaw = item; break;
                case 1: t.teeth = item; break;
                case 2: t.lips = item; break;
                default: throw new Error('unexpected type');
            }
            t.uid.t = item.uid.t;
            t.uid.n = item.uid.n;
            //t.c = item.c;
            t.h = item.h;
            t.l = item.l;
            triple.push(t);
        }

        // Merge each part separately
        this.dataStorage.merge(triple, (target, update) => {
            switch (line) {
                case 0:
                    target.jaw = update.jaw;
                    break;
                case 1:
                    target.teeth = update.teeth;
                    break;
                case 2:
                    target.lips = update.lips;
                    break;
                default: throw new Error('unexpected type');
            }
            if ((target.h !== undefined && update.h !== undefined && target.h < update.h)
                || (target.h === undefined && update.h !== undefined)) { target.h = update.h; }
            if ((target.l !== undefined && update.l !== undefined && target.l > update.l)
                || (target.l === undefined && update.l !== undefined)) { target.l = update.l; }
            return target;
        });
    }

    private shift(array: Candlestick[], n: number) {
        for (let i = array.length - 1; i >= n; i -= 1) {
            array[i].c = array[i - n].c;
            array[i].o = array[i - n].o;
            array[i].h = array[i - n].h;
            array[i].l = array[i - n].l;
        }
    }
}

export class AlligatorIndicatorRenderer implements IChartRender<Candlestick> {

    //private static inst?: AlligatorIndicatorRenderer;

    public constructor() { }

    // public static get instance(): AlligatorIndicatorRenderer {
    //     if (!this.inst) {
    //         this.inst = new AlligatorIndicatorRenderer();
    //     }
    //     return this.inst;
    // }

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Render
        //
        // border lines
        canvas.beginPath();
        canvas.setStrokeStyle('#333333');
        // ... left
        canvas.moveTo(frame.x, frame.y);
        canvas.lineTo(frame.x, frame.y + frame.h - 1);
        // ... bottom
        canvas.lineTo(frame.x + frame.w - 1, frame.y + frame.h - 1);
        // ... right
        canvas.lineTo(frame.x + frame.w - 1, frame.y);
        canvas.stroke();

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#0026FF');
        // Jaw
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof TripleCandlestick) {
                const triple = <TripleCandlestick>item;
                if (triple.jaw && triple.jaw.c !== undefined) {
                    const value = triple.jaw.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#FF0800');
        // Teeth
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof TripleCandlestick) {
                const triple = <TripleCandlestick>item;
                if (triple.teeth && triple.teeth.c !== undefined) {
                    const value = triple.teeth.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#399F16');
        // Lips
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof TripleCandlestick) {
                const triple = <TripleCandlestick>item;
                if (triple.lips && triple.lips.c !== undefined) {
                    const value = triple.lips.c;
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
        return new SettingSet('visual');
    }

    public setSettings(settings: SettingSet): void {
    }
}
