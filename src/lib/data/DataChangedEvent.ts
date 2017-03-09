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
    private _lastDateBefore?: Date;
    private _lastDateAfter?: Date;

    constructor(range: IRange<Date>, interval: TimeInterval, lastDateBefore?: Date, lastDateAfter?: Date) {
        this._range = range;
        this._interval = interval;
        this._lastDateBefore = lastDateBefore;
        this._lastDateAfter = lastDateAfter;
    }

    /**
     * Range of updated data
     */
    public get range() {
        return this._range;
    }

    public get interval() {
        return this._interval;
    }

    /** 
     * Date of the last item before data is changed 
     */
    public get lastDateBefore() {
        return this._lastDateBefore;
    }

    /** 
     * Date of the last item after data is changed 
     */
    public get lastDateAfter() {
        return this._lastDateAfter;
    }
}
