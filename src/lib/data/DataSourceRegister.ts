/**
 * 
 */
import { Candlestick } from '../model/index';
import { IdValue, IHashTable } from '../shared/index';
import { IDataSource } from './Interfaces';

export interface IDataSourceRegister {
    getItem(uid: string): IDataSource<Candlestick>;
    list(): IdValue[];
}

export class DataSourceRegister implements IDataSourceRegister {

    private sources: IHashTable<IDataSource<Candlestick>> = {};
    //private static instance: DataSourceLocator;
    // public static get Instance() {
    //     return this.instance || (this.instance = new this());
    // }

    constructor() {
    }

    public register(uid: string, ds: IDataSource<Candlestick>) {
        this.sources[uid] = ds;
    }

    public list(): IdValue[] {
        const ar = [];
        for (const id of Object.keys(this.sources)) {
            const ds = this.sources[id];
            ar.push(new IdValue(id, ds.asset));
        }
        return ar;
    }

    public getItem(uid: string): IDataSource<Candlestick> {
        const ds = this.sources[uid];
        if (ds) {
            return ds;
        } else {
            throw new Error(`Can not find data source with id='${uid}'.`);
        }
    }
}
