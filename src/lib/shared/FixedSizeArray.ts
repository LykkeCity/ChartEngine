/**
 * FixedSizeArray class.
 */
export class FixedSizeArray<T> {
    private size: number;
    private _length: number = 0;
    private container: T[] = [];
    private comparer: (lhs: T, rhs: T) => number;
    /**
     * Creates instance of array
     * @param size Maximum amount of elements.
     */
    constructor(size: number, comparer: (lhs: T, rhs: T) => number) {
        this.size = size;
        this.comparer = comparer;
    }

    /**
     * Current amount of items in the array.
     */
    public get length() {
        return this._length;
    }

    /**
     * Indexer
     */
    public getItem(index: number): T {
        if (index < 0 || index >= this._length) {
            throw new Error(`Index is out of range. index=${index}, length=${this._length}`);
        }
        return this.container[index];
    }

    public last(): T {
        if (this._length > 0) {
            return this.container[this._length - 1];
        } else {
            throw new Error('Array is empty.');
        }
    }

    public lastOrDefault(): T|undefined {
        if (this._length > 0) {
            return this.container[this._length - 1];
        } else {
            return undefined;
        }
    }

    /**
     * Appends specified element to the end of array.
     * If amount of elements exceeds allowed amount, first element is removed.
     */
    public push(element: T) {
        if (this._length < this.size) {
            this.container[this._length] = element;
            this._length += 1;
        } else {
            // shift left
            for (let i = 1; i < this._length; i += 1) {
                this.container[i - 1] = this.container[i];
            }
            this.container[this._length - 1] = element;
        }
    }

    public pushRange(elements: T[]) {
        if (!elements) {
            throw new Error('Argument is null');
        }
        elements.forEach(element => {
            this.push(element);
        });
    }

    public max(accessor: (item: T) => number|undefined): number | undefined {
        let max: number|undefined = undefined;

        this.container.forEach(el => {
            const value = accessor(el);
            if (value !== undefined) {
                max = Math.max(value, max !== undefined ? max : Number.NEGATIVE_INFINITY);
            }
        });
        return max;
    }

    public min(accessor: (item: T) => number|undefined): number | undefined {
        let min: number|undefined = undefined;

        this.container.forEach(el => {
            const value = accessor(el);
            if (value !== undefined) {
                min = Math.min(value, min !== undefined ? min : Number.POSITIVE_INFINITY);
            }
        });
        return min;
    }
}
