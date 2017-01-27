/**
 * Classes related to grid calculation.
 */
import { TimeInterval } from '../core/index';
import { IHashTable, IRange } from '../shared/index';

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
        50.0000
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
                grid.push(t);
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
        TimeInterval.min,
        TimeInterval.min5,
        TimeInterval.min10,
        TimeInterval.min15,
        TimeInterval.min30,
        TimeInterval.hour,
        TimeInterval.hour4,
        TimeInterval.hour6,
        TimeInterval.hour12,
        TimeInterval.day,
        TimeInterval.day3,
        TimeInterval.day7,
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
        const startBar = this.truncateToInterval(this.range.start, selectedScale);

        // 4. Calculate remaining bars
        let t: Date = startBar;
        while (t <= this.range.end) {
            if (t >= this.range.start) {
                grid.push(t);
            }
            t = this.addInterval(t, selectedScale);
        }

        return grid;
    }

    private truncateToInterval(date: Date, interval: TimeInterval): Date {
        switch (interval) {
            case TimeInterval.min: return this.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(1));
            case TimeInterval.min5: return this.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(5));
            case TimeInterval.min15: return this.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(15));
            case TimeInterval.min30: return this.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(30));
            case TimeInterval.hour: return this.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(1));
            case TimeInterval.hour4: return this.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(4));
            case TimeInterval.hour6: return this.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(6));
            case TimeInterval.hour12: return this.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(12));
            case TimeInterval.day: return this.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(1));
            case TimeInterval.day3: return this.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(3));
            case TimeInterval.day7:
                const firstDay = date.getDate() - date.getDay();
                return new Date(date.setDate(firstDay));
            case TimeInterval.day10: return this.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(10));
            case TimeInterval.month: return new Date(date.getFullYear(), date.getMonth(), 1);
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
    }

    private truncateToTimeSpan(date: Date, timeSpan: TimeSpan): Date {
        if (timeSpan.totalMilliseconds === 0) {
            return date;
        }
        const dateMilliseconds = date.getTime();
        return new Date(dateMilliseconds - (dateMilliseconds % timeSpan.totalMilliseconds));
    }

    private addInterval(date: Date, interval: TimeInterval): Date {
        const newDate = new Date(date.getTime());
        switch (interval) {
            case TimeInterval.min: newDate.setMinutes(newDate.getMinutes() + 1); break;
            case TimeInterval.min5: newDate.setMinutes(date.getMinutes() + 5); break;
            case TimeInterval.min15: newDate.setMinutes(date.getMinutes() + 15); break;
            case TimeInterval.min30: newDate.setMinutes(date.getMinutes() + 30); break;
            case TimeInterval.hour: newDate.setHours(date.getHours() + 1); break;
            case TimeInterval.hour4: newDate.setHours(date.getHours() + 4); break;
            case TimeInterval.hour6: newDate.setHours(date.getHours() + 6); break;
            case TimeInterval.hour12: newDate.setHours(date.getHours() + 12); break;
            case TimeInterval.day: newDate.setDate(date.getDate() + 1); break;
            case TimeInterval.day3: newDate.setDate(date.getDate() + 3); break;
            case TimeInterval.day7: newDate.setDate(date.getDate() + 7); break;
            case TimeInterval.day10: newDate.setDate(date.getDate() + 10); break;
            case TimeInterval.month: newDate.setMonth(date.getMonth() + 1); break;
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
        return newDate;
    }
}

enum TimeUnit {
    Minutes,
    Hours,
    Days,
    Months
}

class TimeSpan {
    private readonly _totalMilliseconds: number;
    // private minutes: number = 0;
    // private hours: number = 0;
    // private days: number = 0;
    // private months: number = 0;

    public get totalMilliseconds(): number {
        return this._totalMilliseconds;
    }

    private constructor(value: number, unit: TimeUnit) {
        switch (unit) {
            case TimeUnit.Minutes:
                this._totalMilliseconds = value * 60000;
                //this.minutes = value;
                break;
            case TimeUnit.Hours:
                this._totalMilliseconds = value * 3600000;
                //this.hours = value;
                break;
            case TimeUnit.Days:
                this._totalMilliseconds = value * 86400000;
                //this.days = value;
                break;
            default:
                throw new Error(`Unexpected TimeUnit value ${ unit }`);
        }
    }

    public static FROM_DAYS(value: number): TimeSpan {
        return new TimeSpan(value, TimeUnit.Days);
    }

    public static FROM_HOURS(value: number): TimeSpan {
        return new TimeSpan(value, TimeUnit.Hours);
    }

    public static FROM_MINUTES(value: number): TimeSpan {
        return new TimeSpan(value, TimeUnit.Minutes);
    }

    public static COMPARE(l: TimeSpan, r: TimeSpan): number {
        return l._totalMilliseconds - r._totalMilliseconds;
    }
}
