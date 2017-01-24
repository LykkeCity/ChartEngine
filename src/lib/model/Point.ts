/**
 * Point class.
 */
import { ITimeValue } from './Interfaces';

export class Point implements ITimeValue {
    public date: Date;
    public value?: number;

    constructor(d: Date, v?: number) {
        this.date = d;
        this.value = v;
    }

    public getValues(): number[] {
        if (this.value) {
            return [this.value];
        } else {
            return [];
        }
    }

    public deserialize(data: any) {
        if (data && data.value) {
            this.value = data.value;
        }
    }
}
