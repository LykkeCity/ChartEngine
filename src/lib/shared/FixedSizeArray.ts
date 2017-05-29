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

    /**
     * Determines maximum value.
     * @param accessor 
     * @param take If specified, checks only last @take elements
     */
    public max(accessor: (item: T) => number|undefined, take?: number): number | undefined {
        let max: number|undefined = undefined;
        const L = this.container.length;
        this.container.forEach((el, index) => {
            if (take !== undefined && index < (L - take)) {
                return; // ignore element if take is specified and it is out of range
            }
            const value = accessor(el);
            if (value !== undefined) {
                max = Math.max(value, max !== undefined ? max : Number.NEGATIVE_INFINITY);
            }
        });
        return max;
    }

    /**
     * Determines minimum value.
     * @param accessor 
     * @param take If specified, checks only last @take elements
     */
    public min(accessor: (item: T) => number|undefined, take?: number): number | undefined {
        let min: number|undefined = undefined;
        const L = this.container.length;
        this.container.forEach((el, index) => {
            if (take !== undefined && index < (L - take)) {
                return; // ignore element if take is specified and it is out of range
            }
            const value = accessor(el);
            if (value !== undefined) {
                min = Math.min(value, min !== undefined ? min : Number.POSITIVE_INFINITY);
            }
        });
        return min;
    }

    /**
     * Returns index of max element or -1
     * @param accessor
     */
    public maxIndex(accessor: (item: T) => number|undefined): number {
        let max: number|undefined = undefined;
        let maxIndex = -1;
        this.container.forEach((el, index) => {
            const value = accessor(el);
            if (value !== undefined && (max === undefined || (max !== undefined && value > max))) {
                max = value;
                maxIndex = index;
            }
        });
        return maxIndex;
    }

    /**
     * Returns index of min element or -1
     * @param accessor
     */
    public minIndex(accessor: (item: T) => number|undefined): number {
        let min: number|undefined = undefined;
        let minIndex = -1;
        this.container.forEach((el, index) => {
            const value = accessor(el);
            if (value !== undefined && (min === undefined || (min !== undefined && value < min))) {
                min = value;
                minIndex = index;
            }
        });
        return minIndex;
    }

    /**
     * Calculates sum of items
     * @param accessor 
     * @param take If specified, checks only last @take elements
     */
    public sum(accessor: (item: T) => number|undefined, take?: number): number | undefined {
        let sum = 0;
        const L = this.container.length;
        this.container.forEach((el, index) => {
            if (take !== undefined && index < (L - take)) {
                return; // ignore element if take is specified and it is out of range
            }
            const value = accessor(el);
            if (value !== undefined) {
                sum += value;
            }
        });
        return sum;
    }
}
