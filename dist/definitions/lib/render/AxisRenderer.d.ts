/**
 * AxisRenderer
 *
 * @classdesc Contains methods for rendering axes.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
export declare class AxisRenderer {
    static renderDateAxis(dateAxis: IAxis<Date>, canvas: ICanvas): void;
    private static drawBar(canvas, date, x);
}
