/**
 * 
 */
import { IIndicatorExtension } from '../core/index';
import { Candlestick } from '../model/index';
import { FixedSizeArray } from '../shared/index';

export abstract class IndicatorExtension implements IIndicatorExtension {
    public abstract amountRequires: number;
    //public abstract name: string;
    public abstract extend(line: FixedSizeArray<Candlestick>): void;
}

export class TrueRangeExtension extends IndicatorExtension {
    public static readonly uname = 'truerange';

    public get amountRequires(): number {
        return 2;
    }

    public extend(line: FixedSizeArray<Candlestick>): void {
        if (line.length < 2) {
            return;
        }

        const current = line.getItem(line.length - 1); // last is current
        const prev = line.getItem(line.length - 2); // Take previous;

        if (current && current.h !== undefined && current.l !== undefined
          && prev && prev.c !== undefined) {
            current.ext['tr'] = Math.max(current.h, prev.c) - Math.min(current.l, prev.c);
        }
    }
}

export class AvgTrueRangeExtension extends IndicatorExtension {
    public static readonly uname = 'avgtruerange';
    private readonly period: number;
    // ATR requires TR
    private trExt = new TrueRangeExtension();

    constructor(period?: number) {
        super();
        if (period !== undefined && period < 1) {
            throw new Error('Period less then 1 is not supported.');
        }

        this.period = period || 14;

        if (this.period < this.trExt.amountRequires) {
            throw new Error('Period can not be less then True Range period.');
        }
    }

    public get amountRequires(): number {
        return this.period;
    }

    public extend(line: FixedSizeArray<Candlestick>): void {

        // Calculate True Range before calculating ATR
        this.trExt.extend(line);

        if (line.length < 2) {
            return;
        }

        const current = line.getItem(line.length - 1); // last is current
        const prev = line.getItem(line.length - 2); // Take previous;

        // If there is previous ATR, than use it, otherwise - use average
        //
        if (current && prev) {
            const prevATR = prev.ext['atr'];
            const curTR = current.ext['tr'];
            if (prevATR !== undefined && curTR !== undefined) {
                current.ext['atr'] = (prevATR * (this.period - 1) + curTR) / this.period;
                //console.log('atr = ' + current.ext['atr']);
                return;
            }
        }

        // Using TR values to calculate ATR
        let sum = 0;
        let counter = 0;
        for (let i = line.length - 1; i >= 0 && counter <= this.period; i -= 1) {
            const tr = current.ext['tr'];
            if (tr !== undefined) {
                sum += tr;
                counter += 1;
            }
        }

        // If amount of TR is enough, calculate ATR
        if (counter === this.period) {
            current.ext['atr'] = sum / this.period;
            //console.log('atr = ' + current.ext['atr']);
        }
    }
}
