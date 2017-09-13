/**
 * 
 */
import { TimeInterval } from '../core/index';
import { Uid } from '../model/index';
import { Event, IRange } from '../shared/index';

export class DataChangedEvent extends Event<DataChangedArgument> {
}

export class DataChangedArgument {
    public lastUidBefore?: Uid;
    public lastUidAfter?: Uid;
    constructor(
        public uidFirst: Uid,     // uid of first element that changed
        public uidLast: Uid,     // uid of last element that changed
        public count: number    // count of elements that changed
    ) {
        if (count < 0) {
            throw new Error('DataChangedArgument property "count" must be positive.');
        }
    }
}
