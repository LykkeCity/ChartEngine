/**
 * 
 */
export class DateUtils {
    public static utcNow(): Date {
        return new Date(); // = Date.now()
    }

    public static getUtcDate(year: number, month: number,
                             day?: number, hour?: number, minute?: number, second?: number, ms?: number) : Date {
        return new Date(Date.UTC(year, month, day || 1, hour || 0, minute || 0, second || 0, ms || 0));
    }
}
