/**
 * LineChartRenderer
 *
 * @classdesc Renders specified data in a form of line chart.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
export declare class LineChartRenderer {
    static render(canvas: ICanvas, data: any, offsetX: number, offsetY: number, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    private static renderPart(canvas, timeAxis, yAxis, pointFrom, pointTo, frameSize);
    private static line(canvas, x1, y1, x2, y2);
}
