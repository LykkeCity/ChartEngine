/**
 * AxisRenderer
 * 
 * @classdesc Contains methods for rendering axes.
 */

import { IAxis } from '../axes/index';
import { ICanvas } from '../canvas/index';
import { TimeInterval } from '../core/index';
import { IPoint, IRange, ISize } from '../shared/index';
import { IAxesRender } from './Interfaces';

export class TimeAxisRenderer implements IAxesRender<Date> {

    public render(canvas: ICanvas, axis: IAxis<Date>, offset: IPoint, frameSize: ISize): void {

        const scaleFit = new ScaleFit(frameSize.width, axis.interval, axis.range);
        const bars: Date[] = scaleFit.getBars();

        canvas.setStrokeStyle('black');
        canvas.beginPath();

        for (const bar of bars) {
            const x = axis.toX(bar);
            this.drawBar(canvas, bar, x);
        }

        canvas.stroke();
        canvas.closePath();
    }

    private drawBar(canvas: ICanvas, date: Date, x: number) : void {

        // draw bar
        canvas.moveTo(x, 7);
        canvas.lineTo(x, 10);

        // draw time mark
        // TODO: Use toString("yyyy-mm...")
        let markText = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}`;
        let w = canvas.measureText(markText).width;
        canvas.strokeText(markText, x - w / 2, 25);

        //console.debug(`bar line: {${x},${7}} - {${x},${10}}`);
    }
}

// Calculates how many bars should be placed on the chart and where it should be placed.
class ScaleFit
{
    private readonly interval: TimeInterval; // Defines maximum zoom
    private range: IRange<Date>;

    private minBars: number;
    private maxBars: number;

    private scales = [
        60000, // 1 min
        300000, // 5 min
        600000, // 10 min
        900000, // 15 min
        1800000, // 30 min
        3600000, // 1h
        14000000, // 4h
        21600000, // 6h
        43200000, // 12h
        86400000, // 1d
        259200000, // 3d
        604800000, // 7d
        864000000, // 10d
        2678400000, // 1m
    ];

    private selectedScale: number = 0;

    constructor(width: number, interval: TimeInterval, range: IRange<Date>) {

        this.interval = interval;
        this.range = range;

        // Calculate min and max count of bars that can be placed on the chart
        [this.minBars, this.maxBars] = this.getMinMaxBars(width);

        // Choose fitting scale
        let dateRange = Math.abs(range.end.getTime() - range.start.getTime());

        this.selectedScale = 0;

        for (var scale of this.scales) {
            if (scale < interval) {
                continue;
            }

            // how many bars require this scale:
            let barsRequired = Math.ceil(dateRange / scale + 1);

            if (barsRequired >= this.minBars && barsRequired <= this.maxBars) {
                this.selectedScale = scale;
                break;
            }
        }
    }

    public getBars(): Date[]
    {
        if (this.selectedScale == 0) {
            return [];
        }

        let bars: Date[] = [];

        // Calculate first bar
        let bar: Date;

        // ... if start time is placed on bar use it, otherwise calculate where first bar lays
        if (this.range.start.getTime() % this.selectedScale == 0)
        {
            bar = this.range.start;
        }
        else {
            // ... add scale value and truncate 
            let time = this.range.start.getTime() + this.selectedScale;
            bar = new Date(time - (time % this.selectedScale));
        }

        // Calculate remaining bars
        let t: number = bar.getTime();
        let end = this.range.end.getTime();
        while (t <= end) {
            bars.push(new Date(t));
            t += this.selectedScale;
        }

        return bars;
    }

    private getMinMaxBars(w: number): number[] {

        // TODO: what if width does not allow any bars
        return [
            3,               // minimum bars
            Math.max(w / 50) // maximum bars
        ];
    }
}

