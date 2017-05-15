/**
 * 
 */
export class CObject {
    private readonly _uid: string;
    private _name: string;

    constructor(uid: string, name: string) {
        this._uid = uid;
        this._name = name;
    }

    public get uid(): string {
        return this._uid;
    }

    public get name(): string {
        return this._name;
    }

    public set name(value: string) {
        this._name = value;
    }
}
