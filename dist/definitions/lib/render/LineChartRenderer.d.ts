/**
 * LineChartRenderer
 *
 * @classdesc Renders specified data in a form of line chart.
 */
import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { IDataIterator } from '../data/index';
import { Point } from '../model/index';
import { IPoint, IRect } from '../shared/index';
import { IChartRender } from './Interfaces';
export declare class LineChartRenderer implements IChartRender<Point> {
    render(canvas: ICanvas, dataIterator: IDataIterator<Point>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): void;
    testHitArea(hitPoint: IPoint, dataIterator: IDataIterator<Point>, frame: IRect, timeAxis: IAxis<Date>, yAxis: IAxis<number>): Point | undefined;
    private renderPart(canvas, timeAxis, yAxis, pointFrom, pointTo, frame);
    private line(canvas, x1, y1, x2, y2);
}
