/**
 * Candle class.
 */
import { IHashTable } from '../shared/index';
import { ITimeValue, IUidValue } from './Interfaces';

export class Uid {
    public t: Date;
    /**
     * Provides uniqueness when t date is repeated.
     */
    public n: number = 0;

    constructor(t?: Date, n?: number) {
        this.t = t || new Date();
        this.n = n || 0;
    }

    /**
     * Compares two Uids.
     * Returns -1 if this object is less, 0 - if equal, 1 - if greater than other.
     * @param other Uid to compare with.
     */
    public compare(other: Uid): number {
        if (other) {
            const thisTime = this.t.getTime();
            const otherTime = other.t.getTime();
            if (thisTime > otherTime || (thisTime === otherTime && this.n > other.n)) {
                return 1;
            } else if (thisTime === otherTime && this.n === other.n)  {
                return 0;
            } else {
                return -1;
            }
        } else {
            throw new Error('Argument is not defined');
        }
    }

    public equals(other: Uid): boolean {
        if (other) {
            if (other === this) { return true; }
            if (other.t.getTime() === this.t.getTime() && other.n === this.n) { return true; }
        }
        return false;
    }
}

export class Candlestick implements ITimeValue, IUidValue {

    public uid: Uid = new Uid();
    public c?: number;
    public o?: number;
    public h?: number;
    public l?: number;
    public ext: IHashTable<number> = {};

    public get date(): Date {
        return this.uid.t;
    }

    public set date(d: Date) {
        this.uid.t = d;
    }

    constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        this.uid.t = date;
        this.c = c;
        this.o = o;
        this.h = h;
        this.l = l;
    }

    public getValues(): number[] {
        const ar: number[] = [];
        if (this.c !== undefined) { ar.push(this.c); }
        if (this.o !== undefined) { ar.push(this.o); }
        if (this.h !== undefined) { ar.push(this.h); }
        if (this.l !== undefined) { ar.push(this.l); }
        return ar;
    }

    public deserialize(data: any) {
        if (data) {
            if (data.c !== undefined) { this.c = data.c; }
            if (data.o !== undefined) { this.o = data.o; }
            if (data.h !== undefined) { this.h = data.h; }
            if (data.l !== undefined) { this.l = data.l; }
        }
    }

    public toString(precision: number) {
        return ` O:${this.o !== undefined ? this.o.toFixed(precision) : 'n/a'}`
            + ` H:${this.h !== undefined ? this.h.toFixed(precision) : 'n/a'}`
            + ` L:${this.l !== undefined ? this.l.toFixed(precision) : 'n/a'}`
            + ` C:${this.c !== undefined ? this.c.toFixed(precision) : 'n/a'}`;
    }
}
