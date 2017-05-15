/**
 * 
 */
import { Uid } from './Candlestick';

export interface ITimeValue {
    date: Date;
    //uid: string;
    //uid: Uid;
    getValues(): number[];
}

export interface IUidValue {
    //date: Date;
    //uid: string;
    uid: Uid;
    getValues(): number[];
}
