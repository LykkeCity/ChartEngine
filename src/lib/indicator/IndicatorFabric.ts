/**
 * IndicatorFabric class.
 * 
 * @classdesc Creates indicator instances.
 */
import { IDataSource } from '../data/index';
import { Candlestick } from '../model/index';
import { IHashTable } from '../shared/index';
//import { IIndicator } from './Interfaces';
import { IndicatorDataSource } from './IndicatorDataSource';

export interface IInstanceCreator {
    new(source: IDataSource<Candlestick>, addInterval: (date: Date) => Date): IDataSource<Candlestick>;
}

export function register(
    indicatorId: string,
    creator: { new(source: IDataSource<Candlestick>, addInterval: (date: Date) => Date): IDataSource<Candlestick> }) {

    IndicatorFabric.instance.register(indicatorId, creator);
}

export class IndicatorFabric {
    private static inst?: IndicatorFabric;
    private ctors: IHashTable<IInstanceCreator> = {};

    private constructor() { }

    public static get instance(): IndicatorFabric {
        if (!this.inst) {
            this.inst = new IndicatorFabric();
        }
        return this.inst;
    }

    public register(indicatorId: string, creator: { new(source: IDataSource<Candlestick>, addInterval: (date: Date) => Date): IDataSource<Candlestick> }) {
        this.ctors[indicatorId] = creator;
    }

    public instantiate(indicatorId: string, source: IDataSource<Candlestick>, addInterval: (date: Date) => Date): IDataSource<Candlestick> {
        const ctor = this.ctors[indicatorId];
        if (ctor) {
            return new ctor(source, addInterval);
        } else {
            throw new Error(`Indicator with id=${indicatorId} is not registered.`);
        }
    }
}
