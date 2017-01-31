/**
 * SimpleIndicator class.
 */
import { TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IRange } from '../shared/index';

export class SimpleIndicator extends DataSource<Point> {

    private dataSource: IDataSource<Candlestick>;
    private dataStorage: ArrayDataStorage<Point>;
    private dataInitialized = false;

    constructor(
        config: DataSourceConfig,
        dataSource: IDataSource<Candlestick>) {
            super(Point, config);

            this.dataSource = dataSource;
            this.dataStorage = new ArrayDataStorage<Point>();
            // subscribe to source events
            const self = this;
            dataSource.dateChanged.on((arg) => { self.onDataSourceChanged(arg); });
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

        const startTime = range.start.getTime();
        const endTime = range.end.getTime();

        return this.dataStorage.getIterator((item: Point) => {
            const itemTime = item.date.getTime();
            return (itemTime >= startTime && itemTime <= endTime);
        });
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
        );
    }

    protected onDataSourceChanged(arg?: DataChangedArgument): void {
        if (arg) {
            // recalculate and notify
            this.update(arg.range, arg.interval);
            this.dateChangedEvent.trigger(new DataChangedArgument(arg.range, arg.interval));
        }
    }

    protected update(range: IRange<Date>, interval: TimeInterval): void {
        const prevValues: number[] = [0, 0];
        const iterator = this.dataSource.getData(range, interval);

        // Recalculate whole range
        //
        const indicatorData: Point[] = [];
        // ... skip first values
        let i = 0;
        while (i < 2 && iterator.moveNext()) {
            const candle = iterator.current;
            if (candle.c) {
                prevValues[i] = candle.c;
            }
            i += 1;
        }

        i = 0;
        while (iterator.moveNext()) {
            if (iterator.current.c) {
                const curValue = iterator.current.c;

                // calculate indicator value
                const indicatorValue = (prevValues[0] + prevValues[1] + curValue) / 3;

                indicatorData[i] = new Point(iterator.current.date, indicatorValue);

                // shift previous values
                prevValues[0] = prevValues[1];
                prevValues[1] = curValue;
            }
            i += 1;
        }

        // Update data storage
        this.dataStorage.merge(indicatorData, (item1, item2) => { return item1.date.getTime() - item2.date.getTime(); });
    }
}
