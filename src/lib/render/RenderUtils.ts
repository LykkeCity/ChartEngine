/**
 * 
 */
import { ICanvas } from '../canvas/index';
import { ChartPoint, IAxis, IPoint, ITimeAxis } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick } from '../model/index';
import { IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class RenderUtils {

    public static renderLineChart(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
        getPoint: (item: Candlestick) => ChartPoint | undefined,
        frame: IRect,
        timeAxis: ITimeAxis,
        yAxis: IAxis<number>,
        closePath?: boolean
    ) {

        let found = false;
        let isFirstPoint = true;
        let firstPoint: IPoint | undefined;
        let lastPoint: IPoint | undefined;
        timeAxis.reset();
        while (timeAxis.moveNext()) {
            const curUid = timeAxis.current;
            const curTime = curUid.t.getTime();
            const curn = curUid.n;
            const x = timeAxis.currentX;

            if (!found) {
                found = dataIterator.goTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn);
            } else {
                found = dataIterator.moveTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn) !== -1;
            }

            if (found) {

                const point = getPoint(dataIterator.current);

                //const candle = dataIterator.current;
                if (point === undefined || point.uid === undefined || point.v === undefined) {
                    continue;
                }

                const y = yAxis.toX(point.v);

                if (isFirstPoint) {
                    canvas.moveTo(x, y);
                    firstPoint = { x: x, y: y };
                    isFirstPoint = false;
                } else {
                    canvas.lineTo(x, y);
                    lastPoint = { x: x, y: y };
                }
            }
        }

        if (closePath && firstPoint && lastPoint) {
            canvas.lineTo(lastPoint.x, frame.h - 1);
            canvas.lineTo(firstPoint.x, frame.h - 1);
            canvas.lineTo(firstPoint.x, firstPoint.y);
        }
    }

    // private drawLine<T>(canvas: ICanvas, items: T[], getPoint: (item: T, index: number) => IPoint | undefined) {

    //     items.forEach((item: T, index: number) => {
    //         const point = getPoint(item, index);
    //         if (!point) {
    //             return;
    //         }


    //     });
    // }
}
