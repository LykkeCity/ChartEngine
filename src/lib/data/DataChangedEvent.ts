/**
 * 
 */
import { Event } from '../shared/index';
import { DataChangedArgument } from './Interfaces';

export class DataChangedEvent extends Event<DataChangedArgument> {
    public trigger(data: DataChangedArgument) {
        super.trigger(data);
    }
}
