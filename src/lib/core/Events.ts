/**
 * 
 */
import { Event } from '../shared/index';
import { IMouse } from './Interfaces';

export class EventArgument {
    constructor() { }
}

export class ObjectEventArgument extends EventArgument {
    constructor(
        public obj: any) {
        super();
    }
}

export class MouseEventArgument extends EventArgument {
    constructor(
        public mouse: IMouse) {
        super();
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

    private _selectionChanged = new Event<ObjectEventArgument>();
    public get selectionChanged(): Event<ObjectEventArgument> {
        return this._selectionChanged;
    }

    private _treeChanged = new Event<EventArgument>();
    public get treeChanged(): Event<EventArgument> {
        return this._treeChanged;
    }
}
