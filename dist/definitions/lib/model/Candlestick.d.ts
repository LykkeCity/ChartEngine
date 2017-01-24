/**
 * Candlestick class.
 */
import { ITimeValue } from './Interfaces';
export declare class Candlestick implements ITimeValue {
    date: Date;
    c?: number;
    o?: number;
    h?: number;
    l?: number;
    constructor(date: Date, c?: number, o?: number, h?: number, l?: number);
    getValues(): number[];
    deserialize(data: any): void;
}
