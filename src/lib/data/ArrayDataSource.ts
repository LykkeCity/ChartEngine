/**
 * CandleArrayDataSource class.
 */
import { ChartType, TimeInterval } from '../core/index';
import { Candlestick, ITimeValue } from '../model/index';
import { Event, IEvent, IRange } from '../shared/index';
import { ArrayIterator } from './ArrayIterator';
import { DataChangedEvent } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { DataType } from './DataType';
import { DataChangedArgument, IDataIterator, IDataSnapshot, IDataSource } from './Interfaces';

export class ArrayDataSource<T extends ITimeValue> extends DataSource<T> {

    protected dataSnapshot: IDataSnapshot<T>;
    private readonly defaultMinValue = 0;
    private readonly defaultMaxValue = 100;

    constructor(
        dataType: { new(d: Date): T },
        config: DataSourceConfig,
        data: T[]) {
            super(dataType, config);
            this.dataSnapshot = {
                data: data,
                timestamp: 0
            };
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T> {

        this.validateRange(range);
        this.validateInterval(interval);

        const data = this.dataSnapshot.data;

        // Find first and last indexes.
        //
        let startIndex = 0;
        for (startIndex = 0; startIndex < data.length; startIndex += 1) {
            if (data[startIndex].date.getTime() >= range.start.getTime()) {
                break;
            }
        }
        let lastIndex = data.length - 1;
        for (lastIndex = data.length - 1; lastIndex >= startIndex; lastIndex -= 1) {
            if (data[lastIndex].date.getTime() <= range.end.getTime()) {
                break;
            }
        }

        return new ArrayIterator<T>(
            this.dataSnapshot,
            startIndex,
            lastIndex,
            this.dataSnapshot.timestamp);
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {

        this.validateRange(range);
        this.validateInterval(interval);

        const data = this.dataSnapshot.data;

        if (data.length === 0) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        data.forEach(item => {
                if (item.date >= range.start && item.date <= range.end) {
                    // update min / max values
                    const values = item.getValues();
                    const min = Math.min(...values);
                    const max = Math.max(...values);
                    if (min < minValue) { minValue = min; }
                    if (max > maxValue) { maxValue = max; }
                }
            });

        return { start: minValue, end: maxValue };
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
            // ChartType.candle,
            // DataType.candle
        );
    }
}
