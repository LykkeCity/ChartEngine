/**
 * ValueAccessorFactory class.
 */
import { Candlestick } from '../model/index';

export enum ValueAccessorType {
    close,
    hl2,
    hlc3,
    ohlc4
}

export interface IValueAccessor {
    (candle: Candlestick): number|undefined;
}

export class ValueAccessorFactory {
    private static inst?: ValueAccessorFactory;

    private close = (c: Candlestick) => { return c.c; };
    private hl2 = (c: Candlestick) => { return c.c; };
    private hlc3 = (c: Candlestick) => { return c.c; };
    private ohlc4 = (c: Candlestick) => { return c.c; };

    private constructor() { }

    public static get instance(): ValueAccessorFactory {
        if (!this.inst) {
            this.inst = new ValueAccessorFactory();
        }
        return this.inst;
    }

    public create(vaType: ValueAccessorType): IValueAccessor {
        switch (vaType) {
            case ValueAccessorType.close: return this.close;
            case ValueAccessorType.hl2: return this.hl2;
            case ValueAccessorType.hlc3: return this.hlc3;
            case ValueAccessorType.ohlc4: return this.ohlc4;
            default: throw new Error('Unexpected value accessor type=' + vaType);
        }
    }
}
