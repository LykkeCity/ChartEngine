/**
 * HttpDataSourceConfig class.
 */
import { TimeInterval } from '../core/index';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataReaderDelegate, IResponse } from './Interfaces';

export class HttpDataSourceConfig<T> extends DataSourceConfig {
    constructor(
        public url: string,
        public timeInterval: TimeInterval,
        public readData: IDataReaderDelegate<T>,
        public resolveData: (response: any) => IResponse<T>,
        public autoupdate = false
    ) {
        super();
    }
}
