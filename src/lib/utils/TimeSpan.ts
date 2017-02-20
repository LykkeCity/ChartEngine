/**
 * TimeSpan class.
 */
export class TimeSpan {
    private readonly _totalMilliseconds: number;

    public get totalMilliseconds(): number {
        return this._totalMilliseconds;
    }

    private constructor(value: number, unit: TimeUnit) {
        switch (unit) {
            case TimeUnit.Minutes:
                this._totalMilliseconds = value * 60000;
                break;
            case TimeUnit.Hours:
                this._totalMilliseconds = value * 3600000;
                break;
            case TimeUnit.Days:
                this._totalMilliseconds = value * 86400000;
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

enum TimeUnit {
    Minutes,
    Hours,
    Days,
    Months
}
