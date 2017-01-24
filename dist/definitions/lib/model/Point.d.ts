/**
 * Point class.
 */
import { ITimeValue } from './Interfaces';
export declare class Point implements ITimeValue {
    date: Date;
    value?: number;
    constructor(d: Date, v?: number);
    getValues(): number[];
    deserialize(data: any): void;
}
