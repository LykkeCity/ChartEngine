/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */
import { TimeAutoGrid } from '../axes/index';
import { CanvasTextBaseLine, ICanvas } from '../canvas/index';
import { IAxis, ITimeAxis } from '../core/index';
import { IRect } from '../shared/index';
import { DateUtils } from '../utils/index';
import { IAxesRender, ITimeAxisRender } from './Interfaces';

export class TimeAxisRenderer implements ITimeAxisRender {

    private readonly monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    public render(canvas: ICanvas, axis: ITimeAxis, frame: IRect): void {

        //const bars: Date[] = axis.getGrid();

        const range = axis.range;
        const scale = TimeAutoGrid.selectScale(frame.w, axis.interval, { start: range.start.t, end: range.end.t });

        canvas.font = '11px Arial';
        canvas.fillStyle = '#000000';
        canvas.setStrokeStyle('black');
        canvas.beginPath();

        let space = 0;
        axis.reset();
        while (axis.moveNext()) {

            const curTime = axis.current.t;
            const curX = axis.currentX;

            const isRound = DateUtils.isRound(curTime, scale);
            if (isRound) {
                this.drawBar(canvas, curTime, curX);
                space = 0;
            //else if (space > )
            } else {
                space += 75;
            }
        }

        // bars.forEach((bar, index) => {
        //     if (bar) {
        //         const x = axis.toX(;
        //         this.drawBar(canvas, bar, x);
        //     }
        // });

        canvas.stroke();
        canvas.closePath();
    }

    private drawBar(canvas: ICanvas, date: Date, x: number) : void {
        canvas.moveTo(x, 0);
        canvas.lineTo(x, 3);

        // draw time mark
        const markText = this.formatDate(date);
        const w = canvas.measureText(markText).width;
        canvas.setTextBaseLine(CanvasTextBaseLine.Top);
        canvas.fillText(markText, x - w / 2, 5);
    }

    private formatDate(date: Date): string {
        // If hours are not 0 or minutes are not 0 then render hh:mm
        // else if 1 Jan then render Year
        // else if 1 day then render Month
        // else render day
        if (date.getUTCHours() !== 0 || date.getUTCMinutes() !== 0) {
            const hh = date.getUTCHours();
            const mm = date.getUTCMinutes();
            return ('0' + hh.toFixed(0)).slice(-2) + ':' + ('0' + mm.toFixed(0)).slice(-2);
        } else if (date.getUTCDate() === 1 && date.getUTCMonth() === 0) {
            return `${ date.getUTCFullYear() }`;
        } else if (date.getUTCDate() === 1) {
            return `${ this.monthNames[date.getUTCMonth()] }`;
        } else {
            return `${ date.getUTCDate() }`;
        }
    }
}
