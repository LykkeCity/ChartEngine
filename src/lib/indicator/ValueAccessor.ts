/**
 * ValueAccessorFactory class.
 */
import { Candlestick } from '../model/index';

export enum ValueAccessorType {
    open,
    high,
    low,
    close,
    hl2,
    hlc3,
    ohlc4,
    hlcc4
}

export interface IValueAccessor {
    (candle: Candlestick): number|undefined;
}

export class ValueAccessorFactory {
    private static inst?: ValueAccessorFactory;

    private open = (c: Candlestick) => { return c.o; };
    private high = (c: Candlestick) => { return c.h; };
    private low = (c: Candlestick) => { return c.l; };
    private close = (c: Candlestick) => { return c.c; };
    private hl2 = (c: Candlestick) => {
        return  (c.h !== undefined && c.l !== undefined) ? (c.h! + c.l) / 2 : undefined;
    }
    private hlc3 = (c: Candlestick) => {
        return (c.h !== undefined && c.l !== undefined && c.c !== undefined) ? (c.h + c.l + c.c) / 3 : undefined;
    }
    private ohlc4 = (c: Candlestick) => {
        return (c.o !== undefined && c.h !== undefined && c.l !== undefined && c.c !== undefined) ? (c.o + c.h + c.l + c.c) / 4 : undefined;
    }
    private hlcc4 = (c: Candlestick) => {
        return (c.h !== undefined && c.l !== undefined && c.c !== undefined) ? (c.h + c.l + c.c + c.c) / 4 : undefined;
    }

    private constructor() { }

    public static get instance(): ValueAccessorFactory {
        if (!this.inst) {
            this.inst = new ValueAccessorFactory();
        }
        return this.inst;
    }

    public create(vaType: ValueAccessorType): IValueAccessor {
        switch (vaType) {
            case ValueAccessorType.open: return this.open;
            case ValueAccessorType.high: return this.high;
            case ValueAccessorType.low: return this.low;
            case ValueAccessorType.close: return this.close;
            case ValueAccessorType.hl2: return this.hl2;
            case ValueAccessorType.hlc3: return this.hlc3;
            case ValueAccessorType.ohlc4: return this.ohlc4;
            case ValueAccessorType.hlcc4: return this.hlcc4;
            default: throw new Error('Unexpected value accessor type=' + vaType);
        }
    }
}
