/**
 * Storage classes.
 */
import { Event } from '../shared/index';
import { ArrayUtils, JsonUtils } from '../utils/index';
import { IStorage } from './Interfaces';

/**
 * Loads and saves storage tree from/to external storage.
 */
export class StorageManager {
    private _root = new StoreContainer();
    private storage?: IStorage;

    constructor(storage?: IStorage) {
        this.storage = storage;
        this._root.changed.on(this.onChanged);
        this.load();
    }

    public root(): StoreContainer {
        return this._root;
    }

    private onChanged = () => {
        this.save();
    }

    private load() {
        if (this.storage) {
            const serialized = this.storage.getItem('__chartboard_storage__');
            if (serialized) {
                // unsubscribe
                if (this._root) {
                    this._root.changed.off(this.onChanged);
                }
                // initialize new container
                const obj = JSON.parse(serialized, JsonUtils.DATEPARSER); // Parsing dates as Date()
                this._root = new StoreContainer(obj);
                // subscribe
                this._root.changed.on(this.onChanged);
            }
        }
    }

    private save() {
        if (this.storage) {
            const obj = this._root.serialize();
            const serialized = JSON.stringify(obj);
            this.storage.setItem('__chartboard_storage__', serialized);
        }
    }
}

/**
 * Represents a node from storage tree.
 */
export class StoreContainer {
    private obj: Object;
    private root?: StoreContainer;

    private _changedEvt = new Event<void>();
    public get changed(): Event<void> {
        return this._changedEvt;
    }

    constructor(obj?: Object, root?: StoreContainer) {
        this.obj = obj || new Object();
        this.root = root;
    }

    /**
     * Gets property's value
     * @param propertyName Can be composite path ("one.two.three")
     */
    public getProperty(propertyName: string): any {

        if (propertyName) {
            // Break path into object names
            const parts = propertyName.split('.');

            let source = this.obj;
            for (let i = 0; i < (parts.length - 1); i += 1) {
                source = (<any>source)[parts[i]];
                if (!source) {
                    return undefined;
                }
            }

            return (<any>source)[parts[parts.length - 1]];
        }
    }

    public setProperty(propertyName: string, value: any) {
        (<any>this.obj)[propertyName] = value;

        this.setChanged();
    }

    public getObjectProperty(propName: string): StoreContainer {
        let o = (<any>this.obj)[propName];
        if (o === undefined) {
            o = new Object();
            (<any>this.obj)[propName] = o;
        }
        return new StoreContainer(o, this.root || this);
    }

    public getArrayProperty(propName: string): StoreArray {
        let o = (<any>this.obj)[propName];
        if (o === undefined) {
            o = new Array();
            (<any>this.obj)[propName] = o;
        }
        return new StoreArray(o, this.root || this);
    }

    public serialize(): object {
        return this.obj;
    }

    public setChanged() {
        if (this.root) {
            this.root.setChanged();
        } else {
            this._changedEvt.trigger();
        }
    }
}

/**
 * Represents array of nodes from storage tree.
 */
export class StoreArray {
    private array: object[] = [];
    private containers: StoreContainer[] = [];
    private root: StoreContainer;
    private count = 0;
    constructor(a: object[], root: StoreContainer) {
        this.array = a;
        this.root = root;
        this.containers = a.map(el => {
            return new StoreContainer(el, root);
        });
    }

    public addItem(): StoreContainer {
        const o = new Object();
        this.array.push(o);

        const container = new StoreContainer(o, this.root);
        this.containers.push(container);

        this.root.setChanged();

        return container;
    }

    public indexOf(predicate: (sc: StoreContainer) => boolean): number {
        let index = -1;
        this.containers.some((sc: StoreContainer, i: number) => {
            if (predicate(sc)) {
                index = i;
                return true;
            }
            return false;
        });
        return index;
    }

    public remove(predicate: (sc: StoreContainer) => boolean): void {
        const removeIndexes: number[] = [];
        this.containers = this.containers.filter((sc: StoreContainer, i: number) => {
            const result = predicate(sc);
            if (result) {
                removeIndexes.push(i);
            }
            return !result;
        });

        for (const i of removeIndexes) {
            this.array.splice(i, 1);
        }

        this.root.setChanged();
    }

    public removeItem(index: number) {
        this.array.splice(index, 1);
        this.containers.splice(index, 1);

        this.root.setChanged();
    }

    public shift(index: number, shift: number) {
        if (index >= 0 && index < this.array.length) {
            ArrayUtils.SHIFT(this.array, index, shift);
            ArrayUtils.SHIFT(this.containers, index, shift);
        }
    }

    public asArray(): StoreContainer[] {
        return this.containers;
    }

    public get length(): number {
        return this.array.length;
    }
}
