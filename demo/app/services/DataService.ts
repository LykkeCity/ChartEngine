/**
 * 
 */
import * as lychart from '../../../src/lychart';
import Candlestick = lychart.model.Candlestick;
import DateUtils = lychart.utils.DateUtils;
import Uid = lychart.model.Uid;
import { Asset } from '../model/Asset';
import { Utils } from './Utils';

interface ISettings {
    assetsUrl: string;
    candlesUrl: string;
}

declare const settings: ISettings;

export class AssetService {

    private static _assets: Asset[];

    public static getAssets(): Promise<Asset[]> {

        const self = this;

        if (this._assets) {
            return new Promise((resolve, reject) => {
                resolve(self._assets);
            });
        }

        return new Promise((resolve, reject) => {
            $.support.cors = true; // Otherwise "no transport" in IE 11.
            $.ajax({
                method: 'GET',
                dataType: 'json',
                url: settings.assetsUrl,
                contentType: 'application/json'
            })
            .then(
                (data: any) => {
                    // save data and resolve
                    self._assets = data;
                    resolve(data);
                },
                reject);
        });
    }
}

function sendRequest(asset: string, timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) {
    $.support.cors = true;
    const sets = {
        method: 'POST',
        crossDomain: true,
        dataType: 'json',
        url: settings.candlesUrl + asset,
        contentType: 'application/json',
        data: JSON.stringify({
            period: Utils.INTERVAL2PERIOD(interval),
            type: 'Bid',
            dateFrom: timeStart.toISOString(),
            dateTo: timeEnd.toISOString()
        })
    };
    return $.ajax(sets);
}

export class DataService {

    private defaultReader: any;

    public getCandle(asset: string, date: Date, interval: lychart.core.TimeInterval): Promise<Candlestick> {
        return new Promise<Candlestick>(resolve => {
            this.readData(asset, date, DateUtils.addInterval(date, interval), interval)
            .then((response: any) => { return DataService.resolveData(response); })
            .then((resolved: lychart.data.IResponse<lychart.model.Candlestick>) => {
                resolve(resolved.data.length > 0 ? resolved.data[0] : undefined);
            });
        });
    }

    public createDataSource(assetPairId: string, timeInterval: lychart.core.TimeInterval) {
        const dataSource = new lychart.data.HttpDataSource(
            lychart.model.Candlestick,
            {
                url: '',
                autoupdate: false,
                readData: this.createDataReader(assetPairId),
                resolveData: DataService.resolveData,
                timeInterval: timeInterval,
                precision: 3
            });
        dataSource.asset = assetPairId;
        return dataSource;
    }

    private createDataReader(asset: string) {
        return (timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) => {
            return sendRequest(asset, timeStart, timeEnd, interval);
        };
    }

    private readData = (asset: string, timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) => {
        return sendRequest(asset, timeStart, timeEnd, interval);
    }

    /**
     * Converts json from server to model.
     */
    private static resolveData = (response: any): lychart.data.IResponse<lychart.model.Candlestick> => {
        if (response) {
            const data = response.data
                .map((item: any) => {
                    const date = new Date(item.t);
                    const stick = new lychart.model.Candlestick(date, item.c, item.o, item.h, item.l);
                    // init uid
                    stick.uid = new Uid(date);
                    return stick;
                });

            return {
                dateFrom: new Date(response.dateFrom),
                dateTo: new Date(response.dateTo),
                interval: Utils.PERIOD2INTERVAL(response.period),
                data: data
            };
        }
        return {
            dateFrom: new Date(),
            dateTo: new Date(),
            interval: lychart.core.TimeInterval.notSet,
            data: []
        };
    }
}
