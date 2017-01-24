/**
 * 
 */
import { ChartType, TimeInterval } from '../core/index';
import { ITimeValue } from '../model/index';
import { IEvent, IRange } from '../shared/index';
import { DataChangedEvent } from './DataChangedEvent';
import { DataSourceConfig } from './DataSourceConfig';
import { DataType } from './DataType';
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
                // this._config.chartType = config.chartType || defaultConfig.chartType;
                // this._config.dataType = config.dataType || defaultConfig.dataType;
            } else {
                this._config = defaultConfig;
            }
    }

    // TODO: Derived classes have their own settings.
    public get config(): DataSourceConfig{
        return this._config;
    }

    // public get chartType(): string {
    //     return this.config.chartType;
    // }

    public get dateChanged(): IEvent<DataChangedArgument> {
        return this.dateChangedEvent;
    }

    public get dataType(): { new(d: Date): T } {
        return this._dataType;
    }

    protected abstract getDefaultConfig(): DataSourceConfig;

    public abstract getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;

    public abstract getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<T>;
}
