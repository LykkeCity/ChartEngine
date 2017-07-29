/**
 * 
 */
import * as lychart from '../../../src/lychart';

export class Storage implements lychart.core.IStorage {
    public getItem(key: string): string | null {
        if (localStorage) {
            return localStorage.getItem(key);
        } else {
            throw new Error('Local storage is not available.');
        }
    }

    public setItem(key: string, value: string) {
        if (localStorage) {
            localStorage.setItem(key, value);
        } else {
            throw new Error('Local storage is not available.');
        }
    }
}
