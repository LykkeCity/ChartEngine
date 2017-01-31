/**
 * 
 */
import { TimeInterval } from '../core/index';
import { Event, IRange } from '../shared/index';

export class DataChangedEvent extends Event<DataChangedArgument> {
}

export class DataChangedArgument {
    private _range: IRange<Date>;
    private _interval: TimeInterval;

    constructor(range: IRange<Date>, interval: TimeInterval) {
        this._range = range;
        this._interval = interval;
    }

    public get range() {
        return this._range;
    }

    public get interval() {
        return this._interval;
    }
}
