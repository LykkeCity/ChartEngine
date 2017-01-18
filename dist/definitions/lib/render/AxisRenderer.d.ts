/**
 * AxisRenderer
 *
 * @classdesc Contains methods for rendering axes.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { IAxesRender } from './Interfaces';
export declare class AxisRenderer implements IAxesRender {
    renderDateAxis(dateAxis: IAxis<Date>, canvas: ICanvas): void;
    private drawBar(canvas, date, x);
}
