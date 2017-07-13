/**
 * 
 */
import { Uid } from '../model/index';
import { Point } from '../shared/index';
import { IMouse } from './Interfaces';

export class ChartPoint {
    public uid?: Uid;
    public v?: number;

    constructor(uid?: Uid, value?: number) {
        this.uid = uid;
        this.v = value;
    }

    public equals(other: ChartPoint) {
        if (other) {
            if (other === this) { return true; }
            if (((this.uid && other.uid && this.uid.equals(other.uid)) || (this.uid === other.uid))
                && (this.v === other.v)) {
                return true;
            }
        }
        return false;
    }
}

export class Mouse implements IMouse {
    public pos = new Point();
    public isDown: boolean = false;
    public isEntered: boolean = false;
}
