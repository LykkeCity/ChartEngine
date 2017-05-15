// /**
//  * HeikinAshiChartRenderer
//  * 
//  * @classdesc Renders specified data in a form of candlestick chart.
//  */
// import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
// import { IAxis, IPoint, ITimeAxis } from '../core/index';
// import { IDataIterator } from '../data/index';
// import { Candlestick } from '../model/index';
// import { IRect } from '../shared/index';
// import { IChartRender } from './Interfaces';

// export class HeikinAshiChartRenderer implements IChartRender<Candlestick>  {

//     private readonly minCandleWidth = 1;
//     private readonly maxCandleWidth = 21;

//     public constructor() { }

//     public render(
//         canvas: ICanvas,
//         dataIterator: IDataIterator<Candlestick>,
//         frame: IRect,
//         timeAxis: ITimeAxis,
//         yAxis: IAxis<number>): void {

//         const candleW = this.calculateBodyWidth(timeAxis, frame.w);

//         let found = false;
//         timeAxis.reset();
//         while (timeAxis.moveNext()) {
//             const curUid = timeAxis.current;
//             const curTime = curUid.t.getTime();
//             const curn = curUid.n;
//             const x = timeAxis.currentX;

//             if (!found) {
//                 found = dataIterator.goTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn);
//             } else {
//                 found = dataIterator.moveTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn) !== -1;
//             }

//             if (found) {
//                 const candle = dataIterator.current;

//                 this.renderCandle(canvas, timeAxis, yAxis, candle, frame, candleW, x);
//             }
//         }
//     }

//     public testHitArea(
//             hitPoint: IPoint,
//             dataIterator: IDataIterator<Candlestick>,
//             frame: IRect,
//             timeAxis: ITimeAxis,
//             yAxis: IAxis<number>): Candlestick | undefined {

//         let candleHit: Candlestick | undefined = undefined;

//         const candleW = this.calculateBodyWidth(timeAxis, frame.w);

//         // while (dataIterator.moveNext()) {
//         //     if (this.testHitAreaCandle(hitPoint, timeAxis, yAxis, dataIterator.current, candleW)) {
//         //         candleHit = dataIterator.current;
//         //         break;
//         //     }
//         // }

//         return candleHit;
//     }

//     private testHitAreaCandle(
//         hitPoint: IPoint,
//         timeAxis: ITimeAxis,
//         yAxis: IAxis<number>,
//         candle: Candlestick,
//         candleW: number): boolean {

//         const hao = candle.ext['ha.o'];
//         const hac = candle.ext['ha.c'];
//         const hah = candle.ext['ha.h'];
//         const hal = candle.ext['ha.l'];

//         if (hao === undefined || hac === undefined || hah === undefined || hal === undefined) {
//             return false;
//         }

//         let x = timeAxis.toX(candle.uid);
//         if (x !== undefined) {
//             x = Math.round(x);

//             const body = this.calculateBody(x, yAxis, hao, hac, candleW);
//             return (hitPoint.x >= body.x && hitPoint.x <= (body.x + body.w)
//                     && hitPoint.y >= body.y && hitPoint.y <= (body.y + body.h));
//         }
//         return false;
//     }

//     private renderCandle(
//         canvas: ICanvas, timeAxis: ITimeAxis, yAxis: IAxis<number>, candle: Candlestick, frame: IRect,
//         candleW: number, x: number): void {

//         const hao = candle.ext['ha.o'];
//         const hac = candle.ext['ha.c'];
//         const hah = candle.ext['ha.h'];
//         const hal = candle.ext['ha.l'];

//         if (hao === undefined || hac === undefined || hah === undefined || hal === undefined) {
//             return;
//         }

//         const colorUp = '#008910';
//         const colorDown = '#D80300';

//         x = Math.round(x);

//         const body = this.calculateBody(x, yAxis, hao, hac, candleW);
//         const h = yAxis.toX(hah);
//         const l = yAxis.toX(hal);

//         // Startin drawing
//         canvas.beginPath();
//         canvas.lineWidth = 1;
//         canvas.setStrokeStyle('#333333');

//         if (body.w > 2) {
//             // Drawing upper shadow
//             this.line(canvas, x, body.y, x, h );

//             // Drawing lower shadow
//             this.line(canvas, x, l, x, body.y + body.h - 1);

//             canvas.stroke();
//         }

//         // Drawing body

//         if (body.w > 2) {
//             if (hac > hao) {
//                 canvas.setFillStyle(colorUp);
//             } else {
//                 canvas.setFillStyle(colorDown);
//             }
//             canvas.fillRect(body.x, body.y, body.w, body.h);
//             canvas.strokeRect(body.x, body.y, body.w, body.h);
//         } else {
//             canvas.beginPath();
//             if (hac > hao) {
//                 canvas.setStrokeStyle(colorUp);
//             } else {
//                 canvas.setStrokeStyle(colorDown);
//             }
//             this.line(canvas, x, body.y, x, body.y + body.h);
//             canvas.stroke();
//         }
//     }

//     private calculateBody(x: number, yAxis: IAxis<number>, o: number, c: number, candleW: number): IRect {
//         const ocMin = yAxis.toX(Math.max(o, c)); // Inverted Y
//         const ocMax = yAxis.toX(Math.min(o, c));
//         return { x: x - Math.floor(candleW / 2), y: ocMin, w: candleW, h: ocMax - ocMin };
//     }

//     private calculateBodyWidth(timeAxis: ITimeAxis, frameWidth: number): number {

//         const candlesCount = timeAxis.count; //  range / timeAxis.interval;
//         let w = frameWidth / (3 * candlesCount);

//         if (w < 1.3) {
//             return 1;
//         } else {
//             w = Math.ceil(w);
//             w = w + ((w + 1) % 2);

//             return Math.min(this.maxCandleWidth, w);
//         }
//    }

//     private line(canvas: ICanvas, x1: number, y1: number, x2: number, y2: number): void {
//         canvas.moveTo(x1, y1);
//         canvas.lineTo(x2, y2);
//     }
// }
