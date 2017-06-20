/**
 * 
 */
import { ICanvas, LinePattern } from '../canvas/index';
import { ChartPoint, IAxis, IPoint, ITimeAxis } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick, IUidValue } from '../model/index';
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

        let isFirstPoint = true;
        let firstPoint: IPoint | undefined;
        let lastPoint: IPoint | undefined;

        RenderUtils.iterate(timeAxis, dataIterator, (data, x) => {
            const point = getPoint(data);
            if (point !== undefined && point.uid !== undefined && point.v !== undefined) {
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
        });

        if (closePath && firstPoint && lastPoint) {
            canvas.lineTo(lastPoint.x, frame.h - 1);
            canvas.lineTo(firstPoint.x, frame.h - 1);
            canvas.lineTo(firstPoint.x, firstPoint.y);
        }
    }

    public static iterate<T extends IUidValue>(timeaxis: ITimeAxis, iter: IDataIterator<T>, action: (data: T, x: number) => void): void {

        if (!iter.goTo(item => true)) {
            // end rendering
            return;
        }
        let found = false;

        timeaxis.reset();
        while (timeaxis.moveNext()) {

            const timeUid = timeaxis.current.uid;
            const x = timeaxis.current.x;

            do {
                const data = iter.current;
                if (data.uid.compare(timeUid) === 0) {
                    found = true;
                    break;
                } else if (data.uid.compare(timeUid) > 0) {
                    found = false;
                    break;
                }
                if (!iter.moveNext()) {
                    // end rendering
                    return;
                }
            } while (true);

            if (found) {
                action(iter.current, x);
            }
        }
    }

    public static PATTERN2SEG(pattern: LinePattern) {
        switch (pattern) {
            case LinePattern.Solid: return [];
            case LinePattern.Dashed: return [5, 10];
            case LinePattern.Pointed: return [2, 8];
            default: throw new Error(`Unexpected line pattern: ${pattern}`);
        }
    }
}
