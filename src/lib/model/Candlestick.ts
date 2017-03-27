/**
 * Candlestick class.
 */
import { ITimeValue } from './Interfaces';

export class Candlestick implements ITimeValue {
    public date: Date;
    public c?: number;
    public o?: number;
    public h?: number;
    public l?: number;

    constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        this.date = date;
        this.c = c;
        this.o = o;
        this.h = h;
        this.l = l;
    }

    public getValues(): number[] {
        const ar: number[] = [];
        if (this.c) { ar.push(this.c); }
        if (this.o) { ar.push(this.o); }
        if (this.h) { ar.push(this.h); }
        if (this.l) { ar.push(this.l); }
        return ar;
    }

    public deserialize(data: any) {
        if (data) {
            if (data.c) { this.c = data.c; }
            if (data.o) { this.o = data.o; }
            if (data.h) { this.h = data.h; }
            if (data.l) { this.l = data.l; }
        }
    }
}
