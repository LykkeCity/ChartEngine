/**
 * Core constants.
 */
export class Constants {

    private static _fiboPercantage: ReadonlyArray<number> = [
        0.236,
        0.382,
        0.5,
        0.618,
        0.764,
        0.786,
        1,
        1.272,
        1.382,
        1.618,
        2,
        2.618,
        4.236
    ];

    public static get FIBO_PERCENTAGE(): ReadonlyArray<number> {
        return this._fiboPercantage;
    }
}
