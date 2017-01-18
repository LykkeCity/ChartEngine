/**
 * LineChartRenderer
 *
 * @classdesc Renders specified data in a form of line chart.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { IChartRender } from './Interfaces';
export declare class LineChartRenderer implements IChartRender {
    render(canvas: ICanvas, data: any, offsetX: number, offsetY: number, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    private renderPart(canvas, timeAxis, yAxis, pointFrom, pointTo, frameSize);
    private line(canvas, x1, y1, x2, y2);
}
