/**
 * Pivot Points indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IHashTable, IRange, IRect } from '../shared/index';
import { DateUtils } from '../utils/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IContext, IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Pivot Point (P) = (High + Low + Close)/3
// Support 1 (S1) = (P x 2) - High
// Support 2 (S2) = P  -  (High  -  Low)
// Resistance 1 (R1) = (P x 2) - Low
// Resistance 2 (R2) = P + (High  -  Low)

// export enum PointType {
//     Middle = 0,
//     Start = 1,
//     End = 2
// }

export class PPCandlestick extends CandlestickExt {
    constructor(dateStart: Date, dateEnd?: Date) {
        super(dateStart);
        this.dateEnd = new Uid(dateEnd);
    }
    /**
     * Pivot Point
     */
    public p: number|undefined;

    /**
     * Support 1
     */
    public s1: number|undefined;

    /**
     * Support 2
     */
    public s2: number|undefined;

    /**
     * Resistance 1
     */
    public r1: number|undefined;

    /**
     * Resistance 2
     */
    public r2: number|undefined;

    //public position = PointType.Middle;
    public promise: Promise<Candlestick> | undefined;

    public dateEnd: Uid;

    public toString() {
        return 'PP: '
            + `${this.p !== undefined ? this.p.toFixed(4) : 'n/a'}`;
    }
}
export class PPIndicator extends IndicatorDataSource<PPCandlestick> {

    protected accessor = ValueAccessorFactory.instance.create(ValueAccessorType.close);

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(PPCandlestick, source, context);
        this.name = 'PP';
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {
        // If arg is not defined build all data
        // Compute data till the end (update data from current place to end)

        let computedArray: PPCandlestick[] = [];

        // Get source data without loading
        const iterator: IDataIterator<Candlestick> = this.source.getIterator();

        // Go to first element
        if (arg) {
            iterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
        } else {
            if (!iterator.moveNext()) { throw new Error('Source does not contain updated data'); }
        }

        // Calculations
        // 

        const firstUid = iterator.current.uid;
        let lastUid;
        let found;
        const storeIter = this.dataStorage.getIterator();
        do {
            lastUid = iterator.current.uid;

            const source = iterator.current;


            // Compute base time
            // 
            const sourceInterval = this.context.interval();
            const extInterval = this.extendInterval(sourceInterval);
            // Get candle for previous period
            const computeDate = DateUtils.truncateToInterval(source.uid.t, extInterval); // Date of current computed candle
            const computeTime = computeDate.getTime();
            const baseDate = DateUtils.addInterval(computeDate, extInterval, -1); // Date for previous period
            const baseTime = baseDate.getTime();

            // Find existing item
            if (!found) {
                found = storeIter.goTo(item => item.uid.t.getTime() === computeTime);
            } else {
                found = storeIter.moveTo(item => item.uid.t.getTime() === computeTime) !== -1;
            }

            if (found) {
                // ignore
            }

            if (!found) {

                // Create promise
                //
                const computed = new PPCandlestick(computeDate, DateUtils.addInterval(computeDate, extInterval, 1));

                // Promise should be in closure
                const promise = this.context.getCandle(this.source.asset, baseDate, extInterval);

                promise.then(candle => {

                    if (candle && candle.h !== undefined && candle.l !== undefined && candle.c !== undefined) {
                        computed.p = (candle.h + candle.l + candle.c) / 3;
                        computed.s1 = 2 * computed.p - candle.h;
                        computed.s2 = computed.p - (candle.h - candle.l);
                        computed.r1 = 2 * computed.p - candle.l;
                        computed.r2 = computed.p + (candle.h - candle.l);
                    }

                    this.context.render();
                });

                computed.promise = promise;
                this.dataStorage.merge([computed]);
            }

        } while (iterator.moveNext());

        //const origArg = new DataChangedArgument(firstUid, lastUid, computedArray.length);
        return arg;
    }

    private extendInterval(interval: TimeInterval): TimeInterval {
        switch (interval) {
            case TimeInterval.sec: return TimeInterval.day;
            case TimeInterval.min: return TimeInterval.day;
            case TimeInterval.min5: return TimeInterval.day;
            case TimeInterval.min15: return TimeInterval.day;
            case TimeInterval.min30: return TimeInterval.week;
            case TimeInterval.hour: return TimeInterval.week;
            case TimeInterval.hour4: return TimeInterval.week;
            case TimeInterval.hour6: return TimeInterval.week;
            case TimeInterval.hour12: return TimeInterval.month;
            case TimeInterval.day: return TimeInterval.month;
            case TimeInterval.day3: return TimeInterval.month;
            //case TimeInterval.day10: return TimeInterval.year;
            // case TimeInterval.week: return TimeInterval.year;
            // case TimeInterval.month: return TimeInterval.year;
            default: throw new Error(`Unexpected time interval ${interval}`);
        }
    }
}

// export class PPIndicator1 extends SimpleIndicator<PPCandlestick> {

//     private ema: IMovingAverageStrategy;
//     private extsettings: PPSettings = new PPSettings();

//     constructor (source: IDataSource<Candlestick>, context: IContext) {
//         super(PPCandlestick, source, context);
//         this.name = 'PP';

//         this.settings.period = 10;
//     }

//     protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
//                          computedArray: FixedSizeArray<PPCandlestick>
//                          ): PPCandlestick {

//         const source = sourceItems.last(); // source must contain at least one item.
//         //const sourcePrev = sourceItems.length > 1 ? sourceItems.getItem(sourceItems.length - 2) : undefined;
//         //const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

//         const computed = new PPCandlestick(source.date);
//         computed.uidOrig.t = source.uid.t;
//         computed.uidOrig.n = source.uid.n;

//         // Get previous period values
//         const sourceInterval = this.context.interval();
//         const extInterval = this.extendInterval(sourceInterval);
//         // Get candle for previous period
//         const baseDate = DateUtils.addInterval(DateUtils.truncateToInterval(source.uid.t, sourceInterval), -1);



//         const promise = this.context.getCandle(this.source.asset, baseDate, extInterval);

//         promise.then(candle => {

//             if (candle && candle.h !== undefined && candle.l !== undefined && candle.c !== undefined) {
//                 computed.p = (candle.h + candle.l + candle.c) / 3;
//                 computed.s1 = 2 * computed.p - candle.h;
//                 computed.s2 = computed.p - (candle.h - candle.l);
//                 computed.r1 = 2 * computed.p - candle.l;
//                 computed.r2 = computed.p + (candle.h - candle.l);
//             }

//             this.dataStorage.add();

//             this.context.render();
//         });

//         return computed;
//     }



//     public getSettings(): SettingSet {
//         const group = new SettingSet({ name: 'datasource', group: true });

//         // group.setSetting('initialFactor', new SettingSet({
//         //     name: 'initialFactor',
//         //     value: this.extsettings.initialFactor.toString(),
//         //     settingType: SettingType.numeric,
//         //     dispalyName: 'Initial factor'
//         // }));

//         // group.setSetting('increment', new SettingSet({
//         //     name: 'increment',
//         //     value: this.extsettings.increment.toString(),
//         //     settingType: SettingType.numeric,
//         //     dispalyName: 'Increment'
//         // }));

//         // group.setSetting('maxFactor', new SettingSet({
//         //     name: 'maxFactor',
//         //     value: this.extsettings.maxFactor.toString(),
//         //     settingType: SettingType.numeric,
//         //     dispalyName: 'Maximum factor'
//         // }));

//         return group;
//     }

//     public setSettings(value: SettingSet): void {
//         // const initialFactor = value.getSetting('datasource.initialFactor');
//         // this.extsettings.initialFactor = (initialFactor && initialFactor.value) ? parseInt(initialFactor.value, 10) : this.extsettings.initialFactor;

//         // const increment = value.getSetting('datasource.increment');
//         // this.extsettings.increment = (increment && increment.value) ? parseInt(increment.value, 10) : this.extsettings.increment;

//         // const maxFactor = value.getSetting('datasource.maxFactor');
//         // this.extsettings.maxFactor = (maxFactor && maxFactor.value) ? parseInt(maxFactor.value, 10) : this.extsettings.maxFactor;

//         // recompute
//         this.compute();
//     }
// }

class PPSettings {
    public initialFactor: number = 0.02;
    public increment: number = 0.02;
    public maxFactor: number = 0.2;
}

class Line {
    public x1: number|undefined;
    public x2: number|undefined;

    public y1: number|undefined;
    public y2: number|undefined;
    public y3: number|undefined;
    public y4: number|undefined;
    public y5: number|undefined;
}

export class PPIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Get first time and last time of visible range

        // TODO: Make specific methods for this (first(), last())
        let firstUid;
        let lastUid;
        timeAxis.reset();
        while (timeAxis.moveNext()) {
            if (firstUid === undefined) {
                firstUid = timeAxis.current;
            }
            lastUid = timeAxis.current;
        }

        if (firstUid === undefined || lastUid === undefined) {
            return;
        }

        // Find candles just before the first, and just after the last time.

        const firstTime = firstUid.t.getTime();
        const lastTime = lastUid.t.getTime();

        // Go to first candles just before first visible or first
        if (!data.goWhile(item => item.uid.t.getTime() < firstTime)) {
            if (!data.goTo(item => true)) {
                return;
            }
        }

        // Move next while date is in visible range
        //
        do {
            // Render current candle
            const points = (data.current instanceof PPCandlestick) ? <PPCandlestick>data.current : undefined;

            if (points) {
                let x1 = timeAxis.toX(points.uid);
                let x2 = timeAxis.toX(points.dateEnd);

                // If can not get x coordinates by time axis, draw line to the border
                if (x1 === undefined) {
                    if (points.uid.t.getTime() < firstTime) { x1 = -1; }
                    if (points.uid.t.getTime() < lastTime) { x1 = frame.x + frame.w + 1; }
                }
                if (x2 === undefined) {
                    if (points.dateEnd.t.getTime() < firstTime) { x2 = -1; }
                    if (points.dateEnd.t.getTime() < lastTime) { x2 = frame.x + frame.w + 1; }
                }

                const line = new Line();
                line.x1 = x1;
                line.x2 = x2;
                if (points.p !== undefined && points.r1 !== undefined && points.r2 !== undefined && points.s1 !== undefined && points.s2 !== undefined) {
                    line.y1 = yAxis.toX(points.p);
                    line.y2 = yAxis.toX(points.r1);
                    line.y3 = yAxis.toX(points.r2);
                    line.y4 = yAxis.toX(points.s1);
                    line.y5 = yAxis.toX(points.s2);

                    canvas.beginPath();
                    canvas.setStrokeStyle('#56B50E');

                    this.line(canvas, line.x1, line.y1, line.x2, line.y1);
                    this.line(canvas, line.x1, line.y2, line.x2, line.y2);
                    this.line(canvas, line.x1, line.y3, line.x2, line.y3);
                    this.line(canvas, line.x1, line.y4, line.x2, line.y4);
                    this.line(canvas, line.x1, line.y5, line.x2, line.y5);

                    canvas.stroke();
                }
            }
        } while (data.moveNext() && data.current.uid.t.getTime() <= lastTime);


        // const times: IHashTable<Line> = {};

        // timeAxis.reset();
        // while (timeAxis.moveNext()) {
        //     const curUid = timeAxis.current;
        //     const curTime = curUid.t.getTime();
        //     const x1 = timeAxis.currentX;

        //     const roundTime = DateUtils.truncateToInterval(curUid.t, interval);
        //     const key: string = roundTime.getTime().toString();

        //     const uid = new Uid(DateUtils.addInterval(roundTime, interval));
        //     const x2 = timeAxis.toX(uid);

        //     const line = new Line();
        //     line.x1 = x1;
        //     line.x2 = x2;
        //     times[key] = line;
        // }

        // // Fill Y values
        // //
        // let found = false;
        // for (const s of Object.keys(times)) {
        //     const line = times[s];

        //     const baseTime = parseInt(s, 10);

        //     if (!found) {
        //         found = data.goTo(item => item.uid.t.getTime() === baseTime);
        //     } else {
        //         found = data.moveTo(item => item.uid.t.getTime() === baseTime) !== -1;
        //     }

        //     const points = (data.current instanceof PPCandlestick) ? <PPCandlestick>data.current : undefined;
        //     if (points && points.p !== undefined && points.r1 !== undefined && points.r2 !== undefined && points.s1 !== undefined && points.s2 !== undefined) {
        //         line.y1 = yAxis.toX(points.p);
        //         line.y2 = yAxis.toX(points.r1);
        //         line.y3 = yAxis.toX(points.r2);
        //         line.y4 = yAxis.toX(points.s1);
        //         line.y5 = yAxis.toX(points.s2);
                
        //     }
        // }

        // // Render
        // //
        // for (const s of Object.keys(times)) {
        //     const line = times[s];

        //     canvas.beginPath();
        //     canvas.setStrokeStyle('#56B50E');

        //     this.line(canvas, line.x1, line.y1, line.x2, line.y1);
        //     this.line(canvas, line.x1, line.y2, line.x2, line.y2);
        //     this.line(canvas, line.x1, line.y3, line.x2, line.y3);
        //     this.line(canvas, line.x1, line.y4, line.x2, line.y4);
        //     this.line(canvas, line.x1, line.y5, line.x2, line.y5);

        //     canvas.stroke();
        // }
    }

    private line(canvas: ICanvas, x1?: number, y1?: number, x2?: number, y2?: number) {
        if (x1 !== undefined && x2 !== undefined && y1 !== undefined && y2 !== undefined) {
            canvas.moveTo(x1, y1);
            canvas.lineTo(x2, y2);
        }
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
