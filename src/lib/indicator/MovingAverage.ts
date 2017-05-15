/**
 * 
 */
import { Candlestick } from '../model/index';
import { FixedSizeArray } from '../shared/index';

export enum MovingAverageType {
    Simple,
    Smoothed,
    Weight
}

export interface IMovingAverageStrategy {
    /**
     * 
     * @param n Range
     * @param value Current item for which to calculate MA.
     * @param precedingValues Items before current item.
     * @param precedingMovingAverage MA value for previous item.
     */
    compute(n: number, precedingValues: FixedSizeArray<Candlestick>,
            accessor: (c: Candlestick) => number|undefined,
            precedingMovingAverage?: number): number|undefined;
}

export class MovingAverageFactory {
    private static inst?: MovingAverageFactory;

    private sma = new SimpleMovingAverage();
    private smma = new SmoothedMovingAverage();
    private wma = new WeightMovingAverage();

    private constructor() { }

    public static get instance(): MovingAverageFactory {
        if (!this.inst) {
            this.inst = new MovingAverageFactory();
        }
        return this.inst;
    }

    public create(maType: MovingAverageType): IMovingAverageStrategy {
        switch (maType) {
            case MovingAverageType.Simple: return this.sma;
            case MovingAverageType.Smoothed: return this.smma;
            case MovingAverageType.Weight: return this.wma;
            default: throw new Error('Unexpected moving average type=' + maType);
        }
    }
}

class SimpleMovingAverage implements IMovingAverageStrategy {
    public compute(n: number, precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   precedingMovingAverage?: number): number|undefined {
        let takeCount = 0;
        if (precedingValues.length === 0) {
            return undefined;
        } else if (precedingValues.length === 1) {
            // if no previous values, return the only value
            return accessor(precedingValues.last());
        } else if (n > precedingValues.length) {
            // if not enough values to build moving average use as much as we can get
            takeCount = precedingValues.length;
        } else {
            // we have enough values 
            takeCount = n;
        }

        let sum = 0;
        // Add last values
        for (let i = 0; i < takeCount; i += 1) {
            const v = accessor(precedingValues.getItem(precedingValues.length - (i + 1)));
            if (v !== undefined) {
                sum += v;
            }
        }
        return sum / takeCount;
    }
}

class SmoothedMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number, precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   precedingMovingAverage?: number): number|undefined {

        if (precedingValues.length < n) {
            // use Simple Moving Average if not enough data
            return this.sma.compute(n, precedingValues, accessor, precedingMovingAverage);
        }

        if (!precedingMovingAverage) {
            throw new Error('Previous moving average must be specified.');
        }

        const curValue = accessor(precedingValues.last());
        return curValue !== undefined
               ? (precedingMovingAverage * (n - 1) + curValue) / n
               : precedingMovingAverage;
    }
}

class WeightMovingAverage implements IMovingAverageStrategy {
    public compute(n: number, precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   precedingMovingAverage?: number): number|undefined {
        // If amount of items is not enough then calculate for decreased N value.
        if (n > precedingValues.length) {
            n = precedingValues.length;
        }

        let sum = 0;
        for (let i = 0; i < n; i += 1) {
            const v = accessor(precedingValues.getItem(precedingValues.length - (i + 1)));
            if (v !== undefined) {
                sum += (n - i) * v;
            }
        }

        return sum / this.divider(n);
    }

    private divider(n: number) {
        return n * (n + 1) / 2;
    }
}
