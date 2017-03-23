/**
 * StateFabric class.
 * 
 * @classdesc Stores instances of state classes for chart board.
 */
import { IHashTable } from '../shared/index';
import { IStateController } from './Interfaces';

export class StateFabric {
    private static inst?: StateFabric;
    private states: IHashTable<IStateController> = {};

    private constructor() { }

    public static get instance(): StateFabric {
        if (!this.inst) {
            this.inst = new StateFabric();
        }
        return this.inst;
    }

    public setState(stateId: string, obj: IStateController) {
        this.states[stateId] = obj;
    }

    public getState(stateId: string): IStateController {
        return this.states[stateId];
    }
}
