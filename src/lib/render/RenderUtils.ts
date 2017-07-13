/**
 * 
 */
import { ICanvas, LinePattern } from '../canvas/index';
import { IAxis, IChartPoint, ITimeAxis } from '../core/index';
import { IDataIterator } from '../data/index';
import { Candlestick, IUidValue } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';

export class RenderUtils {

    public static renderLineChart(
        canvas: ICanvas,
        dataIterator: IDataIterator<Candlestick>,
        getPoint: (item: Candlestick) => IChartPoint | undefined,
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

    /**
     * Fills overlap of the line over specified level.
     * @param canvas 
     * @param points Points of line
     * @param level Y coordinate to calculate overlapping
     * @param up If true - overlapping from up, false - from bottom.
     * @param fillStyle
     */
    public static fillOverlap(canvas: ICanvas, points: IPoint[], level: number, up: boolean, fillStyle: any) {
        if (points.length > 1) {
            const first = points[0];
            const last = points[points.length - 1];

            canvas.beginPath();
            points.forEach((p, index) => {
                if (p) {
                    (index === 0) ? canvas.moveTo(p.x, p.y) : canvas.lineTo(p.x, p.y);
                }
            });
            canvas.lineTo(last.x, up ? canvas.h : 0);
            canvas.lineTo(first.x, up ? canvas.h : 0);
            canvas.closePath();

            canvas.save();
            canvas.clip();

            canvas.setFillStyle(fillStyle);
            canvas.fillRect(0, up ? 0 : level, canvas.w, up ? level : (canvas.h - level));

            canvas.restore();
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
