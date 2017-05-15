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

    // public get uidFirstAsDate() {
    //     return new Date(parseInt(this.uidFirst, 10));
    // }
    // public get uidLastAsDate() {
    //     return new Date(parseInt(this.uidLast, 10));
    // }
}

// export class DataChangedArgument {
//     private readonly _range: IRange<Date>;
//     private readonly _interval: TimeInterval;
//     private readonly _lastDateBefore?: Date;
//     private readonly _lastDateAfter?: Date;

//     constructor(range: IRange<Date>, interval: TimeInterval, lastDateBefore?: Date, lastDateAfter?: Date) {
//         this._range = range;
//         this._interval = interval;
//         this._lastDateBefore = lastDateBefore;
//         this._lastDateAfter = lastDateAfter;
//     }

//     /**
//      * Range of updated data
//      */
//     public get range() {
//         return this._range;
//     }

//     public get interval() {
//         return this._interval;
//     }

//     /** 
//      * Date of the last item before data is changed 
//      */
//     public get lastDateBefore() {
//         return this._lastDateBefore;
//     }

//     /** 
//      * Date of the last item after data is changed 
//      */
//     public get lastDateAfter() {
//         return this._lastDateAfter;
//     }
// }
