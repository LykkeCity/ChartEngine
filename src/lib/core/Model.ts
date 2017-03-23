/**
 * 
 */
import { IMouse } from './Interfaces';

export class ChartPoint {
    public t?: Date;
    public v?: number;

    constructor(time?: Date, value?: number) {
        this.t = time;
        this.v = value;
    }
}

export class Mouse implements IMouse {
    public x: number = 0;
    public y: number = 0;
    public isDown: boolean = false;
    public isEntered: boolean = false;
}
