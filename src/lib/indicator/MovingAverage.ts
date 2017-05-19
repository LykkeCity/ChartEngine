/**
 * 
 */
import { Candlestick } from '../model/index';
import { FixedSizeArray } from '../shared/index';

export enum MovingAverageType {
    ADX,
    DoubleExponential,
    Exponential,
    Simple,
    Smoothed,
    Triangular,
    TripleExponential,
    Weight,
    Wilder
}

export interface IMovingAverageStrategy {
    /**
     * 
     * @param n Range
     * @param value Current item for which to calculate MA. If not specified, then last value from FSArray is considered current.
     * @param precedingValues Items before current item.
     * @param precedingMovingAverage MA value for previous item.
     */
    compute(n: number,
            precedingValues: FixedSizeArray<Candlestick>,
            accessor: (c: Candlestick) => number|undefined,
            value?: Candlestick,
            precedingMovingAverage?: number): number|undefined;
}

export class MovingAverageFactory {
    private static inst?: MovingAverageFactory;

    private adxma = new ADXMovingAverage();
    private ema = new ExponentialMovingAverage();
    private sma = new SimpleMovingAverage();
    private smma = new SmoothedMovingAverage();
    private tma = new TriangularMovingAverage();
    private wma = new WeightMovingAverage();
    private wilderma = new WilderMovingAverage();

    private constructor() { }

    public static get instance(): MovingAverageFactory {
        if (!this.inst) {
            this.inst = new MovingAverageFactory();
        }
        return this.inst;
    }

    public create(maType: MovingAverageType): IMovingAverageStrategy {
        switch (maType) {
            case MovingAverageType.ADX: return this.adxma;
            case MovingAverageType.Exponential: return this.ema;
            case MovingAverageType.Simple: return this.sma;
            case MovingAverageType.Smoothed: return this.smma;
            case MovingAverageType.Triangular: return this.tma;
            case MovingAverageType.Weight: return this.wma;
            case MovingAverageType.Wilder: return this.wilderma;
            default: throw new Error('Unexpected moving average type=' + maType);
        }
    }
}

class ExponentialMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        if (haveCount === 0) {
            return undefined;
        }

        // Calculate first 4 MA as Simple MA
        if (precedingMovingAverage !== undefined && haveCount > 4) {
            // St = a * Yt + (1 - a) * St-1;
            const a = 2 / (n + 1);
            const lastValue = accessor(value !== undefined ? value : precedingValues.last());

            return lastValue !== undefined
                    ? a * lastValue + (1 - a) * precedingMovingAverage
                    : undefined;
        } else {
            // If no previous MA value, calculate as simple ma;
            return this.sma.compute(n, precedingValues, accessor, value, precedingMovingAverage);
        }
    }
}

class SimpleMovingAverage implements IMovingAverageStrategy {
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {
        let takeCount = 0;
        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);
        if (precedingValues.length === 0 && value === undefined) {
            return undefined;
        } else if (precedingValues.length === 1 && value === undefined) {
            // if no previous values, return the only value
            return accessor(precedingValues.last());
        } else if (precedingValues.length === 0 && value !== undefined) {
            // if no previous values, return the only value
            return accessor(value);
        } else if (n > haveCount) {
            // if not enough values to build moving average use as much as we can get
            takeCount = haveCount;
        } else {
            // we have enough values 
            takeCount = n;
        }

        let sum = (value !== undefined ? accessor(value) || 0 : 0);
        let counter = (value !== undefined ? 1 : 0);
        takeCount = takeCount - (value !== undefined ? 1 : 0);
        // Add last values
        for (let i = 0; i < takeCount; i += 1) {
            const v = accessor(precedingValues.getItem(precedingValues.length - (i + 1)));
            if (v !== undefined) {
                sum += v;
                counter += 1;
            }
        }
        return sum / counter;
    }
}

class SmoothedMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        if (haveCount < n) {
            // use Simple Moving Average if not enough data
            return this.sma.compute(n, precedingValues, accessor, value, precedingMovingAverage);
        }

        if (precedingMovingAverage === undefined) {
            throw new Error('Previous moving average must be specified.');
        }

        const curValue = accessor(value !== undefined ? value : precedingValues.last());
        return curValue !== undefined
               ? (precedingMovingAverage * (n - 1) + curValue) / n
               : precedingMovingAverage;
    }
}

class TriangularMovingAverage implements IMovingAverageStrategy {
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        // If amount of items is not enough do not make computation.
        if (n > haveCount) {
            return undefined;
        }

        const mid = Math.round(n / 2);

        let sum = (value !== undefined ? n * (accessor(value) || 0) : 0);
        let divider = 0;
        const startIndex = (value !== undefined ? 2 : 1);
        let triang;
        for (let i = startIndex; i <= n; i += 1) {
            if (i <= mid) {
                triang = i;
            } else {
                triang = mid - (i - mid) + ((n + 1) % 2);
            }

            const v = accessor(precedingValues.getItem(precedingValues.length - ((i - startIndex) + 1)));
            if (v !== undefined) {
                sum += triang * v;
                divider += triang;
            }
        }

        return sum / divider;
    }
}

class WeightMovingAverage implements IMovingAverageStrategy {
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        // If amount of items is not enough then calculate for decreased N value.
        if (n > haveCount) {
            n = haveCount;
        }

        let sum = (value !== undefined ? n * (accessor(value) || 0) : 0);
        let counter = (value !== undefined ? 1 : 0);
        n = n - (value !== undefined ? 1 : 0);
        for (let i = 0; i < n; i += 1) {
            const v = accessor(precedingValues.getItem(precedingValues.length - (i + 1)));
            if (v !== undefined) {
                sum += (n - counter) * v;
                counter += 1;
            }
        }

        return sum / this.divider(counter);
    }

    private divider(n: number) {
        return n * (n + 1) / 2;
    }
}

class WilderMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        if (haveCount === 0) {
            return undefined;
        }

        // If there is previous MA then use it
        if (precedingMovingAverage !== undefined) {
            const curValue = accessor(value !== undefined ? value : precedingValues.last());
            return curValue !== undefined
                ? (precedingMovingAverage + (precedingMovingAverage / n) + curValue)
                : precedingMovingAverage;
        }

        if (haveCount >= n) {
            // First average calculate as simple average
            return this.sma.compute(n, precedingValues, accessor, value, precedingMovingAverage);
        } else {
            // If not enought data do not compute
            return undefined;
        }
    }
}

/**
 * First - simple average.
 * Next - (prev avg x (n - 1) + current) / n
 */
class ADXMovingAverage implements IMovingAverageStrategy {
    private sma = new SimpleMovingAverage();
    public compute(n: number,
                   precedingValues: FixedSizeArray<Candlestick>,
                   accessor: (c: Candlestick) => number|undefined,
                   value?: Candlestick,
                   precedingMovingAverage?: number): number|undefined {

        const haveCount = precedingValues.length + (value !== undefined ? 1 : 0);

        if (haveCount === 0) {
            return undefined;
        }

        // If there is previous MA then use it
        if (precedingMovingAverage !== undefined) {
            const curValue = accessor(value !== undefined ? value : precedingValues.last());
            return curValue !== undefined
                ? (precedingMovingAverage * (n - 1) + curValue) / n
                : precedingMovingAverage;
        }

        if (haveCount >= n) {
            // First average calculate as simple average
            return this.sma.compute(n, precedingValues, accessor, value, precedingMovingAverage);
        } else {
            // If not enought data do not compute
            return undefined;
        }
    }
}
