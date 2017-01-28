/**
 * 
 */
import { TimeInterval } from '../core/index';
import { ITimeValue } from '../model/index';
import { IEvent, IRange } from '../shared/index';
import { DataChangedEvent } from './DataChangedEvent';
import { DataSourceConfig } from './DataSourceConfig';
import { DataChangedArgument, IDataIterator, IDataSource } from './Interfaces';

export abstract class DataSource<T extends ITimeValue> implements IDataSource<T> {
    protected _config: DataSourceConfig;
    protected dateChangedEvent = new DataChangedEvent();
    protected _dataType: { new(d: Date): T };

    constructor(
        dataType: { new(d: Date): T },
        config: DataSourceConfig) {

            this._dataType = dataType;

            const defaultConfig = this.getDefaultConfig();
            if (config) {
                this._config = config;
            } else {
                this._config = defaultConfig;
            }
    }

    // TODO: Derived classes have their own settings.
    public get config(): DataSourceConfig{
        return this._config;
    }

    public get dateChanged(): IEvent<DataChangedArgument> {
        return this.dateChangedEvent;
    }

    public get dataType(): { new(d: Date): T } {
        return this._dataType;
    }

    protected abstract getDefaultConfig(): DataSourceConfig;

    public abstract getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;

    public abstract getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T>;

    protected validateRange(range: IRange<Date>): void {
        if (!range) { throw new Error('Argument "range" is not defined.'); }
        if (!range.start || !range.end) { throw new Error('Range is not defined.'); }
        if (range.start > range.end) { throw new Error('Start of specified range should not be less then end.'); }
    }

    protected validateInterval(interval: TimeInterval): void {
        if (!interval) { throw new Error('Argument "interval" is not defined.'); }
    }
}
