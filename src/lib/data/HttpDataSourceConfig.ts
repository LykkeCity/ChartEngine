/**
 * HttpDataSourceConfig class.
 */
import { TimeInterval } from '../core/index';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataReaderDelegate, IResponse } from './Interfaces';

export class HttpDataSourceConfig<R, S> extends DataSourceConfig {
    constructor(
        public url: string,
        public timeInterval: TimeInterval,
        public readData: IDataReaderDelegate<R>,
        public resolveData: (response: any) => IResponse<S>,
        public autoupdate = false
    ) {
        super();
    }
}
