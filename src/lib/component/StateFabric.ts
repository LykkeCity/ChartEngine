/**
 * StateFabric class.
 * 
 * @classdesc Stores instances of state classes for chart board.
 */
import { IHashTable } from '../shared/index';
import { IStateController } from './Interfaces';

export interface IStateControllerCtor {
    new(): IStateController;
}

export class StateFabric {

    private static reg: IHashTable<IStateControllerCtor> = {};
    private instances: IHashTable<IStateController> = {};

    public static REGISTER(stateId: string, ctor: IStateControllerCtor) {
        if (!this.reg[stateId]) {
            this.reg[stateId] = ctor;
        } else {
            throw new Error('State constructor is already registered.');
        }
    }

    public getState(stateId: string): IStateController {
        let instance = this.instances[stateId];
        if (!instance) {
            const ctor = StateFabric.reg[stateId];
            if (ctor) {
                instance = new ctor();
            } else {
                throw new Error(`Specified stateId "${stateId}" is not registered.`);
            }
        }
        return instance;
    }
}
