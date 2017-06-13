/**
 * 
 */
import { TimeInterval } from '../core/index';
import { TimeSpan } from './TimeSpan';

export class DateUtils {
    public static utcNow(): Date {
        return new Date(); // = Date.now()
    }

    public static getUtcDate(year: number, month: number,
                             day?: number, hour?: number, minute?: number, second?: number, ms?: number) : Date {
        return new Date(Date.UTC(year, month, day || 1, hour || 0, minute || 0, second || 0, ms || 0));
    }

    public static format14(date: Date): string {
        return ('00000000000000' + date.getTime()).slice(-14);
    }

    public static toIsoDate(date: Date): string {
        const year = date.getUTCFullYear();
        const month = ('00' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('00' + date.getUTCDate()).slice(-2);
        return `${year}-${month}-${day}`;
    }

    public static toIso(date: Date): string {
        const year = date.getUTCFullYear();
        const month = ('00' + (date.getUTCMonth() + 1)).slice(-2);
        const day = ('00' + date.getUTCDate()).slice(-2);
        const hour = ('00' + date.getUTCHours()).slice(-2);
        const min = ('00' + date.getUTCMinutes()).slice(-2);
        const sec = ('00' + date.getUTCSeconds()).slice(-2);
        return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
    }

    public static parseIsoDate(text: string): Date|undefined {
        if (text) {
            return new Date(text);
        }
    }

    /**
     * Returns count of intervals b/w two dates. Both dates should be UTC.
     * @param date1 
     * @param date2 
     * @param interval 
     */
    public static diffIntervals(date1: Date, date2: Date, interval: TimeInterval): number {
        const diff = Math.abs(date1.getTime() - date2.getTime());

        switch (interval) {
            case TimeInterval.sec: return Math.floor(diff / 1000);
            case TimeInterval.min: return Math.floor(diff / (1000 * 60));
            case TimeInterval.min5: return Math.floor(diff / (1000 * 60 * 5));
            case TimeInterval.min15: return Math.floor(diff / (1000 * 60 * 15));
            case TimeInterval.min30: return Math.floor(diff / (1000 * 60 * 30));
            case TimeInterval.hour: return Math.floor(diff / (1000 * 60 * 60));
            case TimeInterval.hour4: return Math.floor(diff / (1000 * 60 * 60 * 4));
            case TimeInterval.hour6: return Math.floor(diff / (1000 * 60 * 60 * 6));
            case TimeInterval.hour12: return Math.floor(diff / (1000 * 60 * 60 * 12));
            case TimeInterval.day: return Math.floor(diff / (1000 * 60 * 60 * 24));
            case TimeInterval.day3: return Math.floor(diff / (1000 * 60 * 60 * 24 * 3));
            case TimeInterval.week: return Math.floor(diff / (1000 * 60 * 60 * 24 * 7));
            case TimeInterval.day10: return Math.floor(diff / (1000 * 60 * 60 * 24 * 10));
            case TimeInterval.month:
                const dateMin = date1 < date2 ? date1 : date2;
                const dateMax = date1 < date2 ? date2 : date1;
                return dateMax.getMonth() - dateMin.getMonth()
                    + (12 * (dateMax.getFullYear() - dateMin.getFullYear()));
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
    }

    public static addInterval(date: Date, interval: TimeInterval, times: number = 1): Date {
        const newDate = new Date(date.getTime());
        switch (interval) {
            // TODO: vanilla JS can incorrectly handle "set*" functions. Check with "daylight saving time".
            case TimeInterval.sec: newDate.setSeconds(date.getSeconds() + times * 1); break;
            case TimeInterval.min: newDate.setMinutes(date.getMinutes() + times * 1); break;
            case TimeInterval.min5: newDate.setMinutes(date.getMinutes() + times * 5); break;
            case TimeInterval.min15: newDate.setMinutes(date.getMinutes() + times * 15); break;
            case TimeInterval.min30: newDate.setMinutes(date.getMinutes() + times * 30); break;
            case TimeInterval.hour: newDate.setHours(date.getHours() + times * 1); break;
            case TimeInterval.hour4: newDate.setHours(date.getHours() + times * 4); break;
            case TimeInterval.hour6: newDate.setHours(date.getHours() + times * 6); break;
            case TimeInterval.hour12: newDate.setHours(date.getHours() + times * 12); break;
            case TimeInterval.day: newDate.setDate(date.getDate() + times * 1); break;
            case TimeInterval.day3: newDate.setDate(date.getDate() + times * 3); break;
            case TimeInterval.week: newDate.setDate(date.getDate() + times * 7); break;
            case TimeInterval.day10: newDate.setDate(date.getDate() + times * 10); break;
            case TimeInterval.month: newDate.setMonth(date.getMonth() + times * 1); break;
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
        return newDate;
    }

    public static substractInterval(date: Date, interval: TimeInterval): Date {
        const newDate = new Date(date.getTime());
        switch (interval) {
            // TODO: vanilla JS can incorrectly handle "set*" functions. Check with "daylight saving time".
            case TimeInterval.sec: newDate.setSeconds(date.getSeconds() - 1); break;
            case TimeInterval.min: newDate.setMinutes(date.getMinutes() - 1); break;
            case TimeInterval.min5: newDate.setMinutes(date.getMinutes() - 5); break;
            case TimeInterval.min15: newDate.setMinutes(date.getMinutes() - 15); break;
            case TimeInterval.min30: newDate.setMinutes(date.getMinutes() - 30); break;
            case TimeInterval.hour: newDate.setHours(date.getHours() - 1); break;
            case TimeInterval.hour4: newDate.setHours(date.getHours() - 4); break;
            case TimeInterval.hour6: newDate.setHours(date.getHours() - 6); break;
            case TimeInterval.hour12: newDate.setHours(date.getHours() - 12); break;
            case TimeInterval.day: newDate.setDate(date.getDate() - 1); break;
            case TimeInterval.day3: newDate.setDate(date.getDate() - 3); break;
            case TimeInterval.week: newDate.setDate(date.getDate() - 7); break;
            case TimeInterval.day10: newDate.setDate(date.getDate() - 10); break;
            case TimeInterval.month: newDate.setMonth(date.getMonth() - 1); break;
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
        return newDate;
    }

    public static truncateToInterval(date: Date, interval: TimeInterval): Date {
        switch (interval) {
            case TimeInterval.sec: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_SECONDS(1));
            case TimeInterval.min: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(1));
            case TimeInterval.min5: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(5));
            case TimeInterval.min15: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(15));
            case TimeInterval.min30: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_MINUTES(30));
            case TimeInterval.hour: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(1));
            case TimeInterval.hour4: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(4));
            case TimeInterval.hour6: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(6));
            case TimeInterval.hour12: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_HOURS(12));
            case TimeInterval.day: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(1));
            case TimeInterval.day3: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(3));
            case TimeInterval.week:
                const firstDay = date.getDate() - date.getDay();
                // TODO: Constructor of Date is not UTC.
                return new Date(date.getFullYear(), date.getMonth(), firstDay, 0, - ((new Date()).getTimezoneOffset()));
            case TimeInterval.day10: return DateUtils.truncateToTimeSpan(date, TimeSpan.FROM_DAYS(10));
            case TimeInterval.month:
                // TODO: Constructor of Date is not UTC.
                return new Date(date.getFullYear(), date.getMonth(), 1, 0, - ((new Date()).getTimezoneOffset()));
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
    }

    public static truncateToTimeSpan(date: Date, timeSpan: TimeSpan): Date {
        if (timeSpan.totalMilliseconds === 0) {
            return date;
        }
        const dateMilliseconds = date.getTime();
        return new Date(dateMilliseconds - (dateMilliseconds % timeSpan.totalMilliseconds));
    }

    public static isTruncated(date: Date, timeSpan: TimeSpan): boolean {
        if (timeSpan.totalMilliseconds === 0) {
            return true;
        }
        const dateMilliseconds = date.getTime();
        return ((dateMilliseconds % timeSpan.totalMilliseconds) === 0);
    }

    public static isRound(date: Date, interval: TimeInterval): boolean {
        switch (interval) {
            case TimeInterval.sec: return DateUtils.isTruncated(date, TimeSpan.FROM_SECONDS(1));
            case TimeInterval.min: return DateUtils.isTruncated(date, TimeSpan.FROM_MINUTES(1));
            case TimeInterval.min5: return DateUtils.isTruncated(date, TimeSpan.FROM_MINUTES(5));
            case TimeInterval.min15: return DateUtils.isTruncated(date, TimeSpan.FROM_MINUTES(15));
            case TimeInterval.min30: return DateUtils.isTruncated(date, TimeSpan.FROM_MINUTES(30));
            case TimeInterval.hour: return DateUtils.isTruncated(date, TimeSpan.FROM_HOURS(1));
            case TimeInterval.hour4: return DateUtils.isTruncated(date, TimeSpan.FROM_HOURS(4));
            case TimeInterval.hour6: return DateUtils.isTruncated(date, TimeSpan.FROM_HOURS(6));
            case TimeInterval.hour12: return DateUtils.isTruncated(date, TimeSpan.FROM_HOURS(12));
            case TimeInterval.day: return DateUtils.isTruncated(date, TimeSpan.FROM_DAYS(1));
            case TimeInterval.day3: return DateUtils.isTruncated(date, TimeSpan.FROM_DAYS(3));
            case TimeInterval.week:
                const firstDay = date.getDate() - date.getDay();
                // TODO: Constructor of Date is not UTC.
                const roundDateWeek = new Date(date.getFullYear(), date.getMonth(), firstDay, 0, - ((new Date()).getTimezoneOffset()));
                return roundDateWeek.getTime() === date.getTime();
            case TimeInterval.day10: return DateUtils.isTruncated(date, TimeSpan.FROM_DAYS(10));
            case TimeInterval.month:
                // TODO: Constructor of Date is not UTC.
                const roundDate = new Date(date.getFullYear(), date.getMonth(), 1, 0, - ((new Date()).getTimezoneOffset()));
                return roundDate.getTime() === date.getTime();
            default:
                throw new Error(`Unexpected interval ${ interval }`);
        }
    }
}
