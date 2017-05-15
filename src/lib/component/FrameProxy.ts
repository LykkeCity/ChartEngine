// /**
//  * 
//  */
// import { IAxis, TimeInterval } from '../core/index';
// import { DataChangedArgument, IDataSource } from '../data/index';
// import { Candlestick as C } from '../model/index';
// import { IRange } from '../shared/index';
// import { StringUtils } from '../utils/index';
// import { Frame } from './Frame';

// export class FrameProxy {
//     private readonly frame: Frame;
//     private N: number;
//     private extN: number;
//     private readonly ext = 1;
//     private w: number;
//     private xAxisImpl: XAxisImpl;
//     private readonly defaultMinValue = 0;
//     private readonly defaultMaxValue = 100;

//     constructor(toDate: Date, interval: TimeInterval, N: number, width: number) {
//         this.N = N;
//         this.extN = N + (this.ext * 2);
//         this.w = width;
//         this.frame = new Frame(toDate, interval, this.extN, width);
//         this.xAxisImpl = new XAxisImpl(this.frame, this.N, this.extN, this.w, this.ext);
//     }

//     public addDataSource(uid: string, ds: IDataSource<C>) {
//         this.frame.addDataSource(uid, ds);
//     }

//     public removeDataSource(uid: string) {
//         this.frame.removeDataSource(uid);
//     }

//     public contains(date: Date): boolean {
//         return this.frame.contains(date);
//     }

//     /**
//      * returns extended count
//      * @param uid 
//      */
//     public getData(uid: string): C[] {
//         return this.frame.getData(uid);
//     }

//     public getDataBetween(uid: string, indexStart: number, indexEnd: number): C[] {
//         return this.frame.getDataBetween(uid, indexStart, indexEnd);
//     }

//     public getValuesRange(uid: string): IRange<number> {
//         const data = this.frame.getData(uid);

//         // TODO: Return MINVALUE, MAXVALUE
//         if (!data || data.length === 0) {
//             return { start: this.defaultMinValue, end: this.defaultMaxValue };
//         }

//         let minValue = Number.MAX_VALUE;
//         let maxValue = Number.MIN_VALUE;

//         // TODO: Can be calculated one time when region changed.
//         for (const item of data) {

//             // TODO: Use Candle.IsEmpty
//             if (item.uid === '-1' || item.uid === '0') {
//                 // ignore
//                 continue;
//             }

//             // update min / max values
//             const min = item.l;
//             const max = item.h;
//             if (min && min < minValue) { minValue = min; }
//             if (max && max > maxValue) { maxValue = max; }
//         }

//         return { start: minValue, end: maxValue };
//     }


//     public automove(arg: DataChangedArgument) {
//         if (arg.lastDateBefore && arg.lastDateAfter) {

//             const timeBefore = arg.lastDateBefore.getTime();
//             const timeAfter = arg.lastDateAfter.getTime();

//             const xaxis = this.xAxisImpl;
//             const xdata = this.frame.getXData();

//             const isBeforeInside = xdata.some((v, i) => {
//                 if (v.getTime() === timeBefore) {
//                     if (xaxis.isIndexInside(i)) {
//                         return true;
//                     }
//                 }
//                 return false;
//             });

//             const isAfterInside = xdata.some((v, i) => {
//                 if (v.getTime() === timeAfter) {
//                     if (xaxis.isIndexInside(i)) {
//                         return true;
//                     }
//                 }
//                 return false;
//             });

//             if (isBeforeInside && !isAfterInside) {
//                 this.frame.moveTo(arg.lastDateAfter);
//             }
//         }

//     }

//     public moveTo(date: Date): void {
//         this.frame.moveTo(date);
//     }

//     public get xAxis(): IAxis<Date> {
//         return this.xAxisImpl;
//     }

//     // TODO: Move method to x-axis
//     public toIndex(x: number): number|undefined {
//         return this.xAxisImpl.toIndex(x);
//     }

//     /**
//      * Mouse coord to chart value
//      * @param x Mouse coord x
//      */
//     public xToValue(x: number): Date|string|undefined {

//         // x -> index
//         const index = this.xAxisImpl.toIndex(x);
//         if (!index) {
//             return undefined;
//         }

//         // get frame data (x should be in visible part of frame? what if -60)
//         const framedata = this.frame.getData('primary-data-source');

//         // find uid (not 0 or -1)
//         if (index >= 0 && index < framedata.length && framedata[index].uid !== '0' && framedata[index].uid !== '-1') {
//             return framedata[index].uid;
//         }

//         // if not found take xaxis time with that index
//         return this.xAxis.toValue(x);
//     }

//     public valueToX(value: Date|string): number|undefined {

//         // if uid
//         if (typeof value === 'string') {
//             // ... get main frame
//             const framedata = this.frame.getData('primary-data-source');
//             let index = -1;
//             const item = framedata.some((c, i) => {
//                 if (c.uid === value) {
//                     index = i;
//                     return true;
//                 }

//                 // also check first parts of uid (before point, 000.000) 
//                 return StringUtils.compare(c.uid, value, '.');
//             });

//             if (index !== -1) {
//                 return this.xAxis.toX(index);
//             } else {
//                 // if (framedata.length > 0) {
//                 //     if (framedata[0].uid > value) { return -this.w * 10; }
//                 //     if (framedata[framedata.length - 1].uid < value) { return this.w * 10; }
//                 // }
//             }
//             // ... find uid
//             // ... if not found 
//             // ...... if less then first uid, return -this.w * 10 , or +this.w * 10
//         } else if (value instanceof Date) {
//             // if date
//             // ... call timeaxis
//             const xdata = this.xAxis.getGrid();
//             let index = -1;
//             const item = xdata.forEach((d, i) => { if (d && d.getTime() === value.getTime()) { index = i; } });
//             if (index !== -1) {
//                 return this.xAxis.toX(index);
//             } else {
//                 // if (xdata.length > 0) {
//                 //     if (xdata[0] && xdata[0]. > value) { return -this.w * 10; }
//                 //     if (xdata[xdata.length - 1].uid < value) { return this.w * 10; }
//                 // }
//             }
//         }
//     }

//     // TODO: Move method to x-axis
//     public getIndexesRange(fromX: number, toX: number): IRange<number | undefined> {
//         return this.xAxisImpl.getIndexesRange(fromX, toX);
//     }

//     public set width(value: number) {
//         this.w = value;
//         this.frame.width = value;
//     }
// }

// class XAxisImpl implements IAxis<Date> {
//     private readonly frame: Frame;
//     private N: number;
//     private readonly ext: number;
//     private extN: number;
//     private w: number;

//     constructor(frame: Frame, N: number, extN: number, width: number, ext: number) {
//         this.frame = frame;
//         this.N = N;
//         this.extN = extN;
//         this.w = width;
//         this.ext = ext;
//     }

//     private g: number = 0; // -(wi - 1) <= g <= (wi - 1)

//     private get wi(): number { return Math.floor(this.w / this.N); }

//     public move(direction: number) {
//         if (!direction || direction === 0) {
//             return;
//         }

//         //let gnext = this.g + (direction > 0 ? 1 : -1);
//         let gnext = this.g + direction;

//         const count = Math.floor(gnext / this.wi);
//         gnext = gnext - (count * this.wi);

//         if (count !== 0) {
//             this.frame.move(-count);
//         }

//         this.g = gnext;
//     }

//     public isIndexInside(index: number): boolean {
//         const x = this.toX(index);
//         return x >= 0 && x <= this.w;
//     }

//     public toX(index: number): number {
//         index = index - this.ext;
//         const x = (this.wi * index) + (this.wi / 2) + this.g;
//         return x;
//     }

//     public toValue(x: number): Date | undefined {

//         if (x >= 0 && x <= this.w) {
//             const index = this.toIndex(x);
//             if (index !== undefined) {
//                 const dates = this.frame.getGrid();
//                 return dates[index];
//             }
//         }
//     }

//     public toIndex(x: number): number | undefined {
//         if (x >= 0 && x <= this.w) {
//             // select most nearest value
//             let index = Math.floor((x - this.g) / this.wi) + 1;
//             index = Math.min(Math.max(index, 0), this.extN - 1); // 0 <= index <= (extN - 1)

//             return index;
//         }
//     }

//     public getIndexesRange(fromX: number, toX: number): IRange<number | undefined> {
//         return {
//             start: this.toIndex(fromX),
//             end: this.toIndex(toX)
//         };
//     }

//     public getValuesRange(fromX: number, toX: number): IRange<Date | undefined> {
//         return this.frame.getValuesRange(fromX, toX);
//     }

//     public get range(): IRange<Date> {
//         return this.frame.range;
//     }

//     public get interval(): TimeInterval {
//         return this.frame.interval;
//     }

//     public set interval(value: TimeInterval) {
//         this.frame.interval = value;
//     }

//     public contains(date: Date): boolean {
//         return this.frame.contains(date);
//     }

//     public getGrid(): (Date|undefined)[] {
//         return this.frame.getGrid();
//     }

//     public moveTo(date: Date): void { }

//     public scale(direction: number): void {

//         this.g = 0;

//         let newExtN;

//         if (direction > 0) {                // zooming in
//             newExtN = Math.floor(this.extN * 0.9);
//         } else if (direction < 0) {         // zooming out
//             newExtN = Math.ceil(this.extN * 1.1);
//         } else {
//             return;
//         }

//         if (newExtN >= (1 + this.ext * 2) && newExtN <= 2000) {

//             this.extN = newExtN;
//             this.N = newExtN - (this.ext * 2);
//             this.frame.scaleTo(newExtN);
//         }
//     }
// }
