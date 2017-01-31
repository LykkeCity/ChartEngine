/**
 * CandleArrayDataSource class.
 */
import { TimeInterval } from '../core/index';
import { ITimeValue } from '../model/index';
import { IRange } from '../shared/index';
import { ArrayDataStorage } from './ArrayDataStorage';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataIterator } from './Interfaces';

export class ArrayDataSource<T extends ITimeValue> extends DataSource<T> {

    protected dataStorage: ArrayDataStorage<T>;
    private readonly defaultMinValue = 0;
    private readonly defaultMaxValue = 100;

    constructor(
        dataType: { new(d: Date): T },
        config: DataSourceConfig,
        data: T[]) {
            super(dataType, config);

            this.dataStorage = new ArrayDataStorage<T>(data);
    }

    public getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T> {

        this.validateRange(range);
        this.validateInterval(interval);

        const startTime = range.start.getTime();
        const endTime = range.end.getTime();

        return this.dataStorage.getIterator((item: T) => {
                const itemTime = item.date.getTime();
                return (itemTime >= startTime && itemTime <= endTime);
            });
    }

    public getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number> {

        this.validateRange(range);
        this.validateInterval(interval);

        if (this.dataStorage.isEmpty) {
            return { start: this.defaultMinValue, end: this.defaultMaxValue };
        }

        let minValue = Number.MAX_VALUE;
        let maxValue = Number.MIN_VALUE;

        // Filter data by date and find min/max price
        //
        const startTime = range.start.getTime();
        const endTime = range.end.getTime();
        const iterator = this.dataStorage.getIterator((item: T) => {
            const itemTime = item.date.getTime();
            return (itemTime >= startTime && itemTime <= endTime);
        });

        while (iterator.moveNext()) {
            // update min / max values
            const values = iterator.current.getValues();
            const min = Math.min(...values);
            const max = Math.max(...values);
            if (min < minValue) { minValue = min; }
            if (max > maxValue) { maxValue = max; }
        }

        return { start: minValue, end: maxValue };
    }

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig(
        );
    }
}
