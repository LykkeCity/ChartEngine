import { IRange } from "shared/Interfaces"
import { IDataSource, IChartData } from "core/Interfaces"
import { Candlestick } from "core/Model"
import { IEvent, Event } from "shared/Event"

export class CandleArrayDataSource implements IDataSource<Candlestick>
{
    private dateChangedEvent = new Event<void>();   

    constructor(
        private data: Candlestick[]) {

    }

    public get dateChanged(): IEvent<void> {
        return this.dateChangedEvent;
    }

    public getData(range: IRange<Date>): IChartData<Candlestick> {
        
        let lowestPrice = Number.MAX_VALUE;
        let highestPrice = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        let filteredData: Candlestick[] = this.data
            .filter(function (candle) {
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
            data: filteredData,
            maxOrdinateValue: highestPrice,
            minOrdinateValue: lowestPrice
        };
    }
}