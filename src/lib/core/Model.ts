/**
 * 
 */
import { Uid } from '../model/index';
import { IMouse } from './Interfaces';

export class ChartPoint {
    // public t?: Date;
    // public uid?: string;
    public uid?: Uid;
    public v?: number;

    // constructor(uid?: string, time?: Date, value?: number) {
    //     this.uid = uid;
    //     this.t = time;
    //     this.v = value;
    // }
    constructor(uid?: Uid, value?: number) {
        this.uid = uid;
        this.v = value;
    }
}

export class Mouse implements IMouse {
    public x: number = 0;
    public y: number = 0;
    public isDown: boolean = false;
    public isEntered: boolean = false;
}

