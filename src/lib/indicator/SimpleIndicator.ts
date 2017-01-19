/**
 * SimpleIndicator class.
 */
import { TimeInterval } from '../core';
import { IChartData, IDataSource } from '../data';
import { Candlestick, Point } from '../model';
import { Event, IEvent, IRange } from '../shared';

export class SimpleIndicator implements IDataSource<Point> {
    private dateChangedEvent = new Event<void>();

    constructor(
        private dataSource: IDataSource<Candlestick>) {
        dataSource.dateChanged.on(this.onDataSourceChanged);
    }

    public get dateChanged(): IEvent<void> {
        return this.dateChangedEvent;
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {
        return this.dataSource.getValuesRange(range, interval);
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IChartData<Point> {
        let indicator: Point[] = [];
        let sourceData = this.dataSource.getData(range, interval);

        for(let i = 3; i < sourceData.data.length; i++) {
            let value = (sourceData.data[i-3].c
                + sourceData.data[i-2].c
                + sourceData.data[i-1].c) / 3;
            indicator.push({ date: sourceData.data[i].date , value: value });
        }

        return {
            data: indicator
        };
    }

    protected onDataSourceChanged (arg?: void): void{
        this.dateChangedEvent.trigger();
    }
}
