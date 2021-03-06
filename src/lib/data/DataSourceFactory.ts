/**
 * DataSourceFactory class.
 */
import { ChartType } from '../core/index';
import { Candlestick } from '../model/index';
import { IRange } from '../shared/index';
import { IContext, IDataSource } from './Interfaces';
import { LineBreakDataSource } from './LineBreakDataSource';
import { RangeBarDataSource } from './RangeBarDataSource';
import { RenkoDataSource } from './RenkoDataSource';
import { HeikinAshiDataSource } from './HeikinAshiDataSource';

export class DataSourceFactory {
    public static CREATE<T>(chartType: string, source: IDataSource<Candlestick>, timeRange: IRange<Date>, context: IContext): IDataSource<Candlestick> {
        switch (chartType) {
            case ChartType.candle:
                return source;
            case ChartType.heikinashi:
                return new HeikinAshiDataSource(source, context);
            case ChartType.hollow:
                return source;
            case ChartType.line:
                return source;
            case ChartType.mountain:
                return source;
            case ChartType.ohlc:
                return source;
            case ChartType.rangebar:
                return new RangeBarDataSource(source, timeRange);
            case ChartType.renko:
                return new RenkoDataSource(source, timeRange);
            case ChartType.linebreak:
                return new LineBreakDataSource(source, timeRange);
            default:
                throw new Error(`Unexpected chart type=${chartType}`);
        }
    }
}
