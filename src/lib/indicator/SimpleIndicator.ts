/**
 * SimpleIndicator class.
 */
import { ChartType, TimeInterval } from '../core/index';
import { ArrayIterator, DataChangedArgument, DataChangedEvent, DataSource,
    DataSourceConfig, DataType, IDataIterator, IDataSnapshot, IDataSource } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { Event, IEvent, IRange } from '../shared/index';

export class SimpleIndicator extends DataSource<Point> {

    private dataSnapshot: IDataSnapshot<Point>;
    private dataInitialized = false;

    constructor(
        config: DataSourceConfig,
        private dataSource: IDataSource<Candlestick>) {
            super(Point, config);
            this.dataSnapshot = { data: [], timestamp: 0 };
            dataSource.dateChanged.on(this.onDataSourceChanged);
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {
        return this.dataSource.getValuesRange(range, interval);
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<Point> {

        if (!this.dataInitialized) {
            // Get data from the data source
            // 
            this.update(range, interval);
        }

        const data = this.dataSnapshot.data;
        // Find first and last indexes.
        //
        let startIndex = 0;
        for (startIndex = 0; startIndex < data.length; startIndex++) {
            if (data[startIndex].date.getTime() >= range.start.getTime()) {
                break;
            }
        }
        let lastIndex = data.length - 1;
        for (lastIndex = data.length - 1; lastIndex >= startIndex; lastIndex--) {
            if (data[startIndex].date.getTime() <= range.end.getTime()) {
                break;
            }
        }

        return new ArrayIterator<Point>(
            this.dataSnapshot,
            startIndex,
            lastIndex,
            this.dataSnapshot.timestamp
        );
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
            // ChartType.line,
            // DataType.point
        );
    }

    protected onDataSourceChanged(arg: DataChangedArgument): void {
        if (arg) {
            // recalculate and notify
            this.update(arg.range, arg.interval);
            this.dateChangedEvent.trigger(new DataChangedArgument(arg.range, arg.interval));
        }
    }

    protected update(range: IRange<Date>, interval: TimeInterval): void {
        let prevValues: number[] = [0, 0];
        let iterator = this.dataSource.getData(range, interval);

        // Skip first values
        let i = 0;
        while (i < 2 && iterator.moveNext()) {
            const candle = iterator.current;
            if (candle.c) {
                prevValues[i] = candle.c;
            }
            i++;
        }

        i = 0;
        while (iterator.moveNext()) {
            if (iterator.current.c) {
                let curValue = iterator.current.c;

                // calculate indicator value
                let indicatorValue = (prevValues[0] + prevValues[1] + curValue) / 3;

                this.dataSnapshot.data[i] = new Point(iterator.current.date, indicatorValue);

                // shift previous values
                prevValues[0] = prevValues[1];
                prevValues[1] = curValue;
            }
            i++;
        }

        // update timestamp
        this.dataSnapshot.timestamp = this.dataSnapshot.timestamp + 1;
    }
}
