// /**
//  * 
//  */
// export class FrameArray<T> {
//     private currentIndex = -1;
//     private array: T[] = [];
//     private size = 0;
//     constructor(size: number) {
//         this.size = size;
//     }

//     public getData(startIndex: number, count: number): T[] {
//         if (startIndex < 0 || startIndex >= this.size) {
//             throw new Error(`get index is out of range. startIndex=${startIndex}, count=${count}, size=${this.size}.`);
//         } else {
//             const end = Math.min(startIndex + count, this.size);
//             return this.array.slice(startIndex, end);
//         }
//     }

//     public first(): T {
//         return this.array[0];
//     }

//     public last(): T {
//         return this.array[this.size - 1];
//     }

//     public reset(): void {
//         this.currentIndex = -1;
//     }

//     public goToLast(): boolean {
//         this.currentIndex = this.size - 1;
//         return this.currentIndex !== -1;
//     }

//     public indexOf(predicate: (item: T) => boolean): number {
//         for (let i = 0; i < this.size; i += 1) {
//             if (this.array[i] !== undefined) {
//                 if (predicate(this.array[i])) {
//                     return i;
//                 }
//             }
//         }
//         return -1;
//     }

//     public movePrev(): boolean {
//         if (this.currentIndex > 0) {
//             this.currentIndex -= 1;
//             return true;
//         } else {
//             return false;
//         }
//     }

//     public moveNext(): boolean {
//         if (this.currentIndex < (this.size - 1)) {
//             this.currentIndex += 1;
//             return true;
//         } else {
//             return false;
//         }
//     }

//     /**
//      * Iterator is reset.
//      * @param n 
//      * @param initialize 
//      */
//     public scaleTo(n: number, ctor: (prev?: T, next?: T) => T) {

//         if (n < 1) {
//             throw new Error('Argument is out of range. n=' + n);
//         }

//         const diff = n - this.size;
//         this.size = n;

//         if (diff > 0) {
//             const ext = [];
//             let next = this.array[0];

//             // initialize extension with default value
//             for (let i = diff - 1; i >= 0; i -= 1) {

//                 const value = ctor(undefined, next);
//                 ext[i] = value;
//                 next = value;
//             }

//             // extend
//             this.array = ext.concat(this.array);
//         } else if (diff < 0) {
//             this.array.splice(0, Math.abs(diff));
//         } else {
//             return;
//         }

//         this.reset();
//     }

//     public get current(): T {
//         this.validateIterator();
//         return this.array[this.currentIndex];
//     }

//     public set current(value: T) {
//         this.validateIterator();
//         this.array[this.currentIndex] = value;
//     }

//     public getCurrentIndex(): number {
//         return this.currentIndex;
//     }

//     public insertBefore(value: T) {
//         this.validateIterator();

//         const part1 = this.array.slice(0, this.currentIndex);
//         const part2 = this.array.slice(this.currentIndex); // to end
//         this.array = part1.concat(value, part2);
//     }

//     public insertAfter(value: T) {
//         this.validateIterator();

//         const part1 = this.array.slice(0, this.currentIndex + 1);
//         const part2 = this.array.slice(this.currentIndex + 1); // to end
//         this.array = part1.concat(value, part2);
//     }

//     // index should stay 
//     public removeCurrent(replacement: T, insertRight: boolean) {
//         this.validateIterator();

//         this.removeAndInsert(this.currentIndex, replacement, insertRight);
//     }

//     // index should stay.
//     // insert replacement to the end.
//     public removeFirst(replacement: T) {
//         this.removeAndInsert(0, replacement, true);
//     }

//     // index should stay.
//     // insert replacement to the start.
//     public removeLast(replacement: T) {
//         this.removeAndInsert(this.size - 1, replacement, false);
//     }

//     private removeAndInsert(indexToRemove: number, replacement: T, insertRight: boolean) {
//         if (insertRight) {
//             this.array.splice(indexToRemove, 1);
//             this.array = this.array.concat(replacement);
//         } else { // insert left
//             this.array.splice(indexToRemove, 1);
//             this.array = [replacement].concat(this.array);
//         }
//     }

//     private validateIterator(): void {
//         if (this.currentIndex === -1) {
//             throw new Error('Iterator is not initialized.');
//         }
//     }
// }
