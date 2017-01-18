/**
 * CandleArrayDataSource class.
 */

import { Candlestick } from '../model';
import { Event, IEvent, IRange } from '../shared';
import { IChartData, IDataSource } from './Interfaces';

export class CandleArrayDataSource implements IDataSource<Candlestick>
{
    private dateChangedEvent = new Event<void>();
    private defaultMinValue = 0;
    private defaultMaxValue = 100;

    constructor(
        private data: Candlestick[]) {
    }

    public get dateChanged(): IEvent<void> {
        return this.dateChangedEvent;
    }

    public getValuesRange(range: IRange<Date>): IRange<number> {

        if (this.data.length === 0) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let lowestPrice = Number.MAX_VALUE;
        let highestPrice = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        this.data.forEach(candle => {
                if (candle.date >= range.start && candle.date <= range.end) {
                    // update min / max values
                    if (candle.l < lowestPrice) { lowestPrice = candle.l; }
                    if (candle.h > highestPrice) { highestPrice = candle.h; }
                }
            });

        return { start: lowestPrice, end: highestPrice };
    }

    public getData(range: IRange<Date>): IChartData<Candlestick> {

        let lowestPrice = Number.MAX_VALUE;
        let highestPrice = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        const filteredData: Candlestick[] = this.data.filter(candle => {
                if (candle.date >= range.start && candle.date <= range.end) {

                    // update min / max values
                    if (candle.l < lowestPrice) { lowestPrice = candle.l; }
                    if (candle.h > highestPrice) { highestPrice = candle.h; }

                    return true;
                }
                return false;
            });

        console.debug(`Data Source: min: ${lowestPrice} max: ${highestPrice} data.count: ${filteredData.length}`);

        return {
            data: filteredData
        };
    }
}
