/**
 * SizeChangedEvent class
 */
import { Event, ISize } from '../shared/index';

export class SizeChangedEvent extends Event<SizeChangedArgument> {
}

export class SizeChangedArgument {
    private s: ISize;

    constructor(size: ISize) {
        this.s = size;
    }

    public get size() {
        return this.s;
    }
}
