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

    public max(): T | undefined {
        if (this._length > 0) {
            let max = this.container[0];
            this.container.forEach(el => {
                if (this.comparer(el, max) > 0) {
                    max = el;
                }
            });
            return max;
        }
    }

    public min(): T | undefined {
        if (this._length > 0) {
            let min = this.container[0];
            this.container.forEach(el => {
                if (this.comparer(el, min) < 0) {
                    min = el;
                }
            });
            return min;
        }
    }
}
