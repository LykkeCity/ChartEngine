/**
 * IndicatorFabric class.
 * 
 * @classdesc Creates indicator instances.
 */

import { IDataSource } from '../data/index';
import { Candlestick } from '../model/index';
import { IHashTable } from '../shared/index';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IContext } from './Interfaces';


export interface IInstanceCreator {
    new(source: IDataSource<Candlestick>, context: IContext): IDataSource<Candlestick>;
}

export function register(
    indicatorId: string,
    creator: IInstanceCreator) {

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

    public register(indicatorId: string, creator: IInstanceCreator) {
        this.ctors[indicatorId] = creator;
    }

    public instantiate(
        indicatorId: string,
        source: IDataSource<Candlestick>,
        context: IContext): IDataSource<Candlestick> {

        const ctor = this.ctors[indicatorId];
        if (ctor) {
            return new ctor(source, context);
        } else {
            throw new Error(`Indicator with id=${indicatorId} is not registered.`);
        }
    }
}
