/**
 * 
 */
import { IIndicatorExtension } from '../core/index';
import { Candlestick } from '../model/index';
import { FixedSizeArray } from '../shared/index';
import { UidUtils } from '../utils/index';

export abstract class IndicatorExtension implements IIndicatorExtension {
    public abstract amountRequires: number;
    //public abstract name: string;
    public abstract extend(line: FixedSizeArray<Candlestick>): void;
}

/**
 * TR = max(H - L, |H - C prev|, |L - C prev|)
 */
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

/**
 * +DM
 */
export class UpDirectionalMovementExtension extends IndicatorExtension {
    public static readonly uname = 'pdm';

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
            && prev && prev.h !== undefined && prev.l !== undefined) {
            // UpMove = Current High - Previous High
            // DownMove = Previous Low - Current Low
            const upmove = current.h - prev.h;
            const downmove = prev.l - current.l;
            // If UpMove > DownMove and UpMove > 0, then +DM = UpMove, else +DM = 0
            current.ext['pdm'] = (upmove > downmove && upmove > 0) ? upmove : 0;
        }
    }
}

/**
 * -DM
 */
export class DownDirectionalMovementExtension extends IndicatorExtension {
    public static readonly uname = 'mdm';

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
            && prev && prev.h !== undefined && prev.l !== undefined) {
            // UpMove = Current High - Previous High
            // DownMove = Previous Low - Current Low            
            const upmove = current.h - prev.h;
            const downmove = prev.l - current.l;
            // If DownMove > Upmove and Downmove > 0, then -DM = DownMove, else -DM = 0 
            current.ext['mdm'] = (downmove > upmove && downmove > 0) ? downmove : 0;
        }
    }
}

/**
 * ATR
 */
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

/**
 * Gain/Loss
 */
export class GainLossExtension extends IndicatorExtension {
    //public static readonly uname = 'gainloss';
    private uid: string;
    private accessor: (c: Candlestick) => number|undefined;

    /**
     * Creates extension
     * @param fieldName Name of the field to use
     */
    constructor (accessor: (c: Candlestick) => number|undefined) {
        super();
        this.accessor = accessor;
        this.uid = UidUtils.NEWUID();
    }

    public get amountRequires(): number {
        return 2;
    }

    public get uname(): string {
        return 'gainloss' + this.uid;
    }

    public extend(line: FixedSizeArray<Candlestick>): void {
        if (line.length < 2) {
            return;
        }

        const current = line.getItem(line.length - 1); // last is current
        const prev = line.getItem(line.length - 2); // Take previous;
        const curValue = this.accessor(current);
        const prevValue = this.accessor(prev);

        if (curValue && prevValue) {
            let gain = 0;
            let loss = 0;
            if (curValue > prevValue) {
                gain = curValue - prevValue;
            } else if (curValue < prevValue) {
                loss = prevValue - curValue;
            }
            current.ext['gain_' + this.uid] = gain;
            current.ext['loss_' + this.uid] = loss;
        }
    }

    public value(c: Candlestick): IGainLoss {
        return {
            gain: c && c.ext ? c.ext['gain_' + this.uid] : undefined,
            loss: c && c.ext ? c.ext['loss_' + this.uid] : undefined
        };
    }
}

export interface IGainLoss {
    gain: number | undefined;
    loss: number | undefined;
}
