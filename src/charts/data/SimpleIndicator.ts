/**
 * SimpleIndicator class.
 */

import { IChartData, IDataSource } from 'core/Interfaces';
import { Candlestick, Point } from 'core/Model';
import { Event, IEvent } from 'shared/Event';
import { IRange } from 'shared/Interfaces';

export class SimpleIndicator implements IDataSource<Point>
{
    private dateChangedEvent = new Event<void>();

    constructor(
        private dataSource: IDataSource<Candlestick>) {
        dataSource.dateChanged.on(this.onDataSourceChanged);
    }

    public get dateChanged(): IEvent<void> {
        return this.dateChangedEvent;
    }

    public getData(range: IRange<Date>): IChartData<Point> {
        let indicator: Point[] = [];
        let sourceData = this.dataSource.getData(range);

        for(let i = 3; i < sourceData.data.length; i++) {
            
            let value = (sourceData.data[i-3].c
                + sourceData.data[i-2].c
                + sourceData.data[i-1].c) / 3;
            indicator.push({ date: sourceData.data[i].date , value: value });
        }

        return {
            data: indicator,
            minOrdinateValue: sourceData.minOrdinateValue,
            maxOrdinateValue: sourceData.maxOrdinateValue
        };
    }

    protected onDataSourceChanged (arg?: void): void{
        this.dateChangedEvent.trigger();
    }
}