/**
 * 
 */
//import { Candlestick } from '../model/index';
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
    compute(n: number, value: number, precedingValues: FixedSizeArray<number>, precedingMovingAverage?: number): number;
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
    public compute(n: number, value: number, precedingValues: FixedSizeArray<number>, precedingMovingAverage?: number): number {
        let takeCount = 0;
        if (precedingValues.length === 0) {
            // if no previous values, return itself
            return value;
        } else if (n > (precedingValues.length + 1)) {
            // if not enough values to build moving average use as much as we can get
            takeCount = precedingValues.length;
        } else {
            // we have enough values 
            takeCount = n - 1;
        }

        let sum = value;
        // Add last values
        for (let i = 0; i < takeCount; i += 1) {
            sum += precedingValues.getItem(precedingValues.length - (i + 1));
        }
        return sum / (takeCount + 1);
    }
}

class SmoothedMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number, value: number, precedingValues: FixedSizeArray<number>, precedingMovingAverage?: number): number {
        if (precedingValues.length < n) {
            // use Simple Moving Average if not enough data
            return this.sma.compute(n, value, precedingValues, precedingMovingAverage);
        }

        if (!precedingMovingAverage) {
            throw new Error('Previous moving average must be specified.');
        }

        return (precedingMovingAverage * (n - 1) + value) / n;
    }
}

class WeightMovingAverage implements IMovingAverageStrategy {
    public compute(n: number, value: number, precedingValues: FixedSizeArray<number>, precedingMovingAverage?: number): number {
        // If amount of items is not enough then calculate for decreased N value.
        if (n > (precedingValues.length + 1)) {
            n = precedingValues.length + 1;
        }

        let sum = n * value;
        for (let i = 1; i < n; i += 1) {
            sum += (n - i) * precedingValues.getItem(precedingValues.length - i);
        }
        return sum * this.divider(n);
    }

    private divider(n: number) {
        return n * (n + 1) / 2;
    }
}
