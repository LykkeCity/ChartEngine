/**
 * SimpleIndicator class.
 */
import { TimeInterval } from '../core/index';
import { DataChangedArgument, DataSource, DataSourceConfig, IDataIterator, IDataSource } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IRange } from '../shared/index';
export declare class SimpleIndicator extends DataSource<Point> {
    private dataSource;
    private dataSnapshot;
    private dataInitialized;
    constructor(config: DataSourceConfig, dataSource: IDataSource<Candlestick>);
    getValuesRange(range: IRange<Date>, interval: TimeInterval): IRange<number>;
    getData(range: IRange<Date>, interval: TimeInterval): IDataIterator<Point>;
    protected getDefaultConfig(): DataSourceConfig;
    protected onDataSourceChanged(arg?: DataChangedArgument): void;
    protected update(range: IRange<Date>, interval: TimeInterval): void;
}
