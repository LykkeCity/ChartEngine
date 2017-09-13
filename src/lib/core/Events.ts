/**
 * 
 */
import { Event } from '../shared/index';
import { CObject } from './CObject';
import { IMouse } from './Interfaces';

export class EventArgument {
    constructor() { }
}

export class ObjectEventArgument extends EventArgument {
    constructor(
        public obj?: CObject) {
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
    public constructor() { }

    private _selectionChanged = new Event<ObjectEventArgument>();
    public get selectionChanged(): Event<ObjectEventArgument> {
        return this._selectionChanged;
    }

    private _treeChanged = new Event<EventArgument>();
    public get treeChanged(): Event<EventArgument> {
        return this._treeChanged;
    }

    private _historyChanged = new Event<EventArgument>();
    public get historyChanged(): Event<EventArgument> {
        return this._historyChanged;
    }
}
