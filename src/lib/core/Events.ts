/**
 * 
 */
import { Event } from '../shared/index';

export class ObjectArgument {
    constructor(
        //public uid: string,
        public obj: any
    ) {

    }
}

export class Events {
    private static inst?: Events;
    protected constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new Events();
        }
        return this.inst;
    }

    private _objectSelected = new Event<ObjectArgument>();

    public get objectSelected(): Event<ObjectArgument> {
        return this._objectSelected;
    }
}
