/**
 * HttpDataSourceConfig class.
 */
import { DataSourceConfig } from './DataSourceConfig';
import { IResponse } from './Interfaces';

export class HttpDataSourceConfig<T> extends DataSourceConfig {
    constructor(
        public url: string,
        public readData: (timeStart: Date, timeEnd: Date, interval: string) => JQueryPromise<IResponse<T>>
    ) {
        super();
    }
}
