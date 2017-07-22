/**
 * JSON utils
 */
const reISO = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*))(?:Z|(\+|-)([\d|:]*))?$/;
const reMsAjax = /^\/Date\((d|-|.*)\)[\/|\\]$/;

export class JsonUtils {
    /**
     * Parses date from string to Date object.
     * Used with JSON parser.
     * @param key Property name.
     * @param value String value to parse.
     */
    public static DATEPARSER(key: string, value: any) {
        if (typeof value === 'string') {
            let a = reISO.exec(value);
            if (a) {
                return new Date(value);
            }
            a = reMsAjax.exec(value);
            if (a) {
                const b = a[1].split(/[-+,.]/);
                return new Date(b[0] ? +b[0] : 0 - +b[1]);
            }
        }
        return value;
    };
}
