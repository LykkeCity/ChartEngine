/**
 * Utils class.
 */
import * as lychart from '../../../src/lychart';
import TimeInterval = lychart.core.TimeInterval;

export class Utils {
    public static INTERVAL2PERIOD(interval: TimeInterval) {
        switch (interval) {
            case TimeInterval.sec: return 'Sec';
            case TimeInterval.min: return 'Minute';
            case TimeInterval.hour: return 'Hour';
            case TimeInterval.day: return 'Day';
            case TimeInterval.month: return 'Month';
            default: throw new Error('Unexpected interval.');
        }
    }

    public static PERIOD2INTERVAL(period: string): TimeInterval {
        switch (period) {
            case 'Sec': return TimeInterval.sec;
            case 'Minute': return TimeInterval.min;
            case 'Hour': return TimeInterval.hour;
            case 'Day': return TimeInterval.day;
            case 'Month': return TimeInterval.month;
            default: throw new Error('Unexpected period.');
        }
    }
}
