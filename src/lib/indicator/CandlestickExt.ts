/**
 * 
 */
import { Candlestick, Uid } from '../model/index';

export class CandlestickExt extends Candlestick {
    public uidOrig: Uid = new Uid();
    public isFake: boolean = false;
}
