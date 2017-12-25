/**
 * Core constants.
 */

export class Colors {
    public readonly UP = '#56A05F';
    public readonly DOWN = '#D3393B';
    public readonly BORDERUP = '#225437';
    public readonly BORDERDOWN = '#5B1A13';
    public readonly SHADOW = '#737375';

    public readonly FORE = '#FF0000';
}

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

    public static readonly DEFAULT_FORECOLOR = '#FF0000';

    public static readonly COLOR = new Colors();
}
