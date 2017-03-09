/**
 * Classes related to grid calculation.
 */
import { TimeInterval } from '../core/index';
import { IRange } from '../shared/index';
import { DateUtils, NumberUtils } from '../utils/index';

export class NumberAutoGrid {

    private readonly length: number;
    private readonly minInterval: number;
    private readonly range: IRange<number>;
    private static readonly scales = [
        0.0005,
        0.0010,
        0.0025,
        0.0050,
        0.0100,
        0.0250,
        0.0500,
        0.1000,
        0.2500,
        0.5000,
        1.0000,
        5.0000,
        10.0000,
        25.0000,
        50.0000,
        100,
        250,
        500,
        1000,
        2500,
        5000,
        10000,
        25000,
        50000,
        100000,
        250000,
        500000
    ];

    constructor(length: number, minInterval: number, range: IRange<number>) {
        if (!length || length <= 0) { throw new Error(`Argument "length" ${ length } is out of range.`); }
        if (!minInterval || minInterval <= 0) { throw new Error(`Argument "minInterval" ${ minInterval } is out of range.`); }
        if (!range || range.end === undefined || range.start === undefined) { throw new Error('Argument "range" is not specified.'); }

        this.length = length;
        this.minInterval = minInterval;
        this.range = range;
    }

    public getGrid(): number[] {
        const grid: number[] = [];

        // 1. Define how many bars can be fitted
        const [minBars, maxBars] = [1, Math.floor(this.length / 20)];

        // 2. Choose fitting scale
        const rangeAbs = Math.abs(this.range.end - this.range.start);
        let selectedScale = 0;
        for (const scale of NumberAutoGrid.scales) {
            if (scale < this.minInterval) {
                continue;
            }

            // how many bars does this scale require:
            const barsRequired = Math.floor(rangeAbs / scale) + 1;

            if (barsRequired >= minBars && barsRequired <= maxBars) {
                selectedScale = scale;
                break;
            }
        }
        if (selectedScale === 0) { return []; }

        // 3. Calculate first bar
        //
        // ... if start time is placed on bar use it, otherwise calculate where first bar lies
        let bar = 0;
        if (this.range.start % selectedScale === 0) {
            bar = this.range.start;
        } else {
            // ... add scale value and truncate 
            const num = this.range.start + selectedScale;
            bar = num - (num % selectedScale);
        }

        // 4. Calculate remaining bars
        let t: number = bar;
        while (t <= this.range.end) {
            if (t >= this.range.start) {
                grid.push(NumberUtils.roundTo(t, 4));
            }
            t += selectedScale;
        }

        return grid;
    }
}

export class TimeAutoGrid {

    private readonly width: number;
    private readonly minInterval: TimeInterval;
    private readonly range: IRange<Date>;
    // private readonly convertToMsTable: IHashTable<number> = {
    //     min: 60000
    // };

    private static readonly scales: TimeInterval[] = [
        TimeInterval.sec,
        TimeInterval.min,
        TimeInterval.min5,
        TimeInterval.min15,
        TimeInterval.min30,
        TimeInterval.hour,
        TimeInterval.hour4,
        TimeInterval.hour6,
        TimeInterval.hour12,
        TimeInterval.day,
        TimeInterval.day3,
        TimeInterval.week,
        TimeInterval.day10,
        TimeInterval.month
    ];

    constructor(width: number, minInterval: TimeInterval, range: IRange<Date>) {
        if (!width || width <= 0) { throw new Error(`Argument "width" ${ width } is out of range.`); }
        if (!minInterval || minInterval < 0) { throw new Error(`Argument "minInterval" ${ minInterval } is out of range.`); }
        if (!range || range.end === undefined || range.start === undefined) { throw new Error('Argument "range" is not specified.'); }

        this.width = width;
        this.minInterval = minInterval;
        this.range = range;
    }


    public getGrid(): Date[] {
        const grid: Date[] = [];

        // 1. Define how many bars can be fitted
        const [minBars, maxBars] = [1, Math.floor(this.width / 75)];

        // 2. Choose fitting scale
        const rangeInMs = Math.abs(this.range.end.getTime() - this.range.start.getTime());
        let selectedScale = 0;
        for (const scale of TimeAutoGrid.scales) {
            if (scale < this.minInterval) {
                continue;
            }

            // how many bars does this scale require:
            const barsRequired = Math.floor(rangeInMs / scale) + 1;

            if (barsRequired >= minBars && barsRequired <= maxBars) {
                selectedScale = scale;
                break;
            }
        }
        if (selectedScale === 0) { return []; }

        // 3. Calculate first bar
        // ... truncate date to the nearest round date.
        const startBar = DateUtils.truncateToInterval(this.range.start, selectedScale);

        // 4. Calculate remaining bars
        let t: Date = startBar;
        while (t <= this.range.end) {
            if (t >= this.range.start) {
                grid.push(t);
            }
            t = DateUtils.addInterval(t, selectedScale);
        }

        return grid;
    }
}
