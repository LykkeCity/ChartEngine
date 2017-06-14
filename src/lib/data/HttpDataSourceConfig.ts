/**
 * HttpDataSourceConfig class.
 */
import { TimeInterval } from '../core/index';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataReaderDelegate, IResponse } from './Interfaces';

export class HttpDataSourceConfig<S> extends DataSourceConfig {
    constructor(
        public url: string,
        public timeInterval: TimeInterval,
        public readData: IDataReaderDelegate,
        public resolveData: (response: any) => IResponse<S>,
        public precision: number,
        public autoupdate = false) {
        super(precision);
    }
}
