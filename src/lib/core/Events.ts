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

    private _objectSelected = new Event<ObjectEventArgument>();
    public get objectSelected(): Event<ObjectEventArgument> {
        return this._objectSelected;
    }

    private _objectTreeChanged = new Event<EventArgument>();
    public get objectTreeChanged(): Event<EventArgument> {
        return this._objectTreeChanged;
    }

    private _mouseMove = new Event<MouseEventArgument>();
    public get mouseMove(): Event<MouseEventArgument> {
        return this._mouseMove;
    }
}
