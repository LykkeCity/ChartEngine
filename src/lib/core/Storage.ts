/**
 * Wrapper for a IStorage interface.
 */
import { IStorage } from './Interfaces';

export class Storage implements IStorage {
    private store?: IStorage;

    constructor(store?: IStorage) {
        this.store = store;
    }

    public getItem(key: string): string | null {
        if (this.store) {
            return this.store.getItem(key);
        }
        return null;
    }

    public setItem(key: string, value: string): void {
        if (this.store) {
            this.store.setItem(key, value);
        }
    }
}
