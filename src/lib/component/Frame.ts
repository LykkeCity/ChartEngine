// /**
//  * 
//  */
// import { TimeAutoGrid } from '../axes/index';
// import { IAxis, TimeInterval } from '../core/index';
// import { DataChangedArgument, IDataIterator, IDataSource } from '../data/index';
// import { Candlestick as C } from '../model/index';
// import { IHashTable, IRange, IRect } from '../shared/index';
// import { DateUtils } from '../utils/index';
// import { FrameArray } from './FrameArray';

// class Time {
//     public isFake: boolean = false;
//     public t: Date = new Date();
// }

// export interface ISubframes {
//     reset(): void;
//     goTo(n: number): void;
//     moveNext(): boolean;
//     movePrev(): boolean;
//     removeCurrent(insertRight: boolean): void;

//     /**
//      * Insert after current and moves current to inserted 
//      */
//     insertAfterWithLeftShiftAndSetCurrent(date: Date): void;
//     insertBeforeWithRightShiftAndSetCurrent(date: Date): void;
// }

// export class Frame implements ISubframes {

//     // TODO: Include undefined into IHashTable<T> ?
//     private dsources: IHashTable<IDataSource<C>|undefined> = {};
//     private subframes: IHashTable<FrameArray<C>|undefined> = {};
//     private timeaxis: FrameArray<Time>;
//     private N: number;
//     private M: number;
//     private w: number;
//     private frameStart: number;
//     private _interval: TimeInterval;

//     constructor(toDate: Date, interval: TimeInterval, N: number, width: number) {
//         this.N = N;
//         this.M = N * 3;
//         this.w = width;
//         this.timeaxis = new FrameArray<Time>(this.M);
//         this.frameStart = N;
//         this._interval = interval;

//         // Generate fake time sequence
//         const startIndex = (2 * N) - 1;
//         //const startDate = new Date(toDate.getTime() - intervalMs * ((2 * N) - 1));

//         let curDate = DateUtils.truncateToInterval(toDate, interval);
//         curDate = DateUtils.addInterval(curDate, interval, -((2 * N) - 1));

//         let i = 0;
//         this.timeaxis.reset();
//         while (this.timeaxis.moveNext()) {
//             // TODO: Get rid of getTime() + new Date conversion
//             const t = new Time();
//             t.isFake = true;
//             // t.t = new Date(curDate.getTime() + i * intervalMs);
//             t.t = curDate;
//             curDate = DateUtils.addInterval(curDate, interval);

//             this.timeaxis.current = t;
//             i += 1;
//         }
//     }

//     public addDataSource(uid: string, ds: IDataSource<C>) {
//         this.dsources[uid] = ds;

//         const array = new FrameArray<C>(this.M);
//         this.subframes[uid] = array;

//         // Generate fake (empty) values
//         array.reset();
//         while (array.moveNext()) {
//             array.current = C.CREATE_EMPTY();
//         }

//         // Subscribe to events:
//         ds.dataChanged.on(this.createHandler(uid));

//         // TODO: Send request to data
//         // ... Get latest date
//         const latestDate = this.timeaxis.last();
//         // ... Request data
//         const dataIterator = ds.getDataByDate(latestDate.t, -this.M);

//         this.mergeData(uid, dataIterator);
//     }

//     public removeDataSource(uid: string) {
//         if (!uid || !this.dsources[uid]) {
//             return;
//         }

//         // TODO: merge empty data

//         // remove variables
//         this.subframes[uid] = undefined;
//         this.dsources[uid] = undefined;

//         // unsubscribe from event. Handler will check if datasource is removed.
//     }

//     public getData(uid: string): C[] {
//         const array = this.subframes[uid];
//         if (array) {
//             return array.getData(this.frameStart, this.N);
//         } else {
//             throw new Error('Data source not found. uid=' + uid);
//         }
//     }

//     public getXData(): Date[] {
//         return this.timeaxis.getData(this.frameStart, this.N)
//             .map(t => t.t);
//     }

//     public getAllData(uid: string): C[] {
//         const array = this.subframes[uid];
//         if (array) {
//             return array.getData(0, this.M);
//         } else {
//             throw new Error('Data source not found. uid=' + uid);
//         }
//     }

//     public getDataBetween(uid: string, indexStart: number, indexEnd: number): C[] {
//         const array = this.subframes[uid];
//         if (array) {
//             if (indexStart > 0 && indexStart < this.N && indexEnd > 0 && indexEnd < this.N && indexEnd >= indexStart) {
//                 return array.getData(this.frameStart + indexStart, indexEnd - indexStart + 1);
//             } else {
//                 throw new Error('Arguments out of range. uid=' + uid);
//             }
//         } else {
//             throw new Error('Data source not found. uid=' + uid);
//         }
//     }

//     private createHandler(uid: string) {

//         return (arg: DataChangedArgument) => {
//             const ds = this.dsources[uid];
//             if (ds) {
//                 const itemUid = arg.uidFirst;
//                 const count = arg.count;
//                 console.debug(`ondatachanged: ds.getData itemUid=${new Date(parseInt(itemUid, 10))} count=${count}`);
//                 const dataIterator = ds.getData(itemUid, count);
//                 this.mergeData(uid, dataIterator);
//             }
//         };
//     }

//     private mergeData(uid: string, dataIterator: IDataIterator<C>) {

//         // const ar = [1,2,3,4].map((value) => { if(dataIterator.moveNext()) { return dataIterator.current; } });
//         // ar.reduce((prev, cur) => prev + ' ' + cur
//         console.debug(`mergeData count=${dataIterator.count()}`);

//         const subframe2 = this.subframes[uid];

//         if (!subframe2) {
//             throw new Error('Data source is not found. uid=' + uid);
//         }

//         // 1. Find anchor
//         // TODO: Optimize searching anchor

//         this.all.goTo(2 * this.N - 1);
//         let anchor: C | undefined;
//         while (this.all.moveNext()) {
//             let curSub = subframe2.current;
//             let curTime = this.timeaxis.current;

//             let res = dataIterator.goTo((item) => item.uid === curSub.uid || item.date.getTime() === curTime.t.getTime());
//             if (res) {
//                 anchor = dataIterator.current;
//                 break;
//             }
//         }

//         if (!anchor) {  // not found
//             this.all.goTo(2 * this.N);

//             while(this.all.movePrev()) {
//                 let curSub = subframe2.current;
//                 let curTime = this.timeaxis.current;

//                 let res = dataIterator.goTo((item: C) => item.uid === curSub.uid || item.date.getTime() === curTime.t.getTime());
//                 if (res) {
//                     anchor = dataIterator.current;
//                     break;
//                 }
//             }
//         }

//         if (!anchor) { // not found
//             console.log('Anchor is not found. uid=' + uid);
//             return;
//         }

//         // 2 No Sync anchor - will be done later
//         //
//         // subframe2.current = dataIterator.current;
//         // this.timeaxis.current.isFake = false; // always updating time.isFake
        
//         // Store anchor index
//         //anchor = dataIterator.current;
//         const anchorIndex: number = subframe2.getCurrentIndex();
//         if (anchorIndex === -1) {
//             throw new Error('Current index is -1');
//         }

//         // 3. Sync left

//         // subframe.goTo(anchor.uid);       // unnecessary
//         // dataIterator.gotTo(anchor.uid);

//         let insertedFakesLeft: number = 0;
//         let insertedFakesRight: number = 0;

//         while (true) {
//             // delete fakes + insert fakes left

//             const data = dataIterator.current;
//             const sub = subframe2.current;
//             const time = this.timeaxis.current;

//             // compare
//             if (data.date.getTime() === time.t.getTime()) {
//                 // update
//                 subframe2.current = data;
//                 this.timeaxis.current.isFake = false; // always updating time.isFake
//             } else if (time.t.getTime() < data.date.getTime()) {
//                 // insert after.
//                 // data iterator moves.
//                 // subframes moves.
//                 this.all.insertAfterWithLeftShiftAndSetCurrent(data.date);
//                 subframe2.current = data;
//                 this.timeaxis.current.isFake = false; // always updating time.isFake
//             } else {
//                 if (this.timeaxis.current.isFake) {
//                     // remove fake column.
//                     // data iterator stays.
//                     // subframes stays.
//                     this.all.removeCurrent(false); // insert fake from left
//                     insertedFakesLeft += 1;
//                     continue;
//                 } else {
//                     // data iterator stays
//                     // subframes goes further
//                     dataIterator.moveNext(); // compensate shift
//                 }
//             }

//             if (!dataIterator.movePrev() || !this.all.movePrev()) {
//                 break;
//             }
//         }

//         //console.log('all.goTo anchorIndex=' + anchorIndex);

//         // 4. Sync right
//         this.all.goTo(anchorIndex);
//         const res = dataIterator.goTo((c) => c.uid === (<C>anchor).uid);
//         if (!res) {
//             throw new Error('Data is not found. uid=' + anchor.uid);
//         }

//         // let 
//         // if (!dataIterator.moveNext() || !this.all.moveNext()) {
//         //     break;
//         // }        

//         while (true) {
//             const data = dataIterator.current;
//             const sub = subframe2.current;
//             const time = this.timeaxis.current;

//             // compare
//             if (data.date.getTime() === time.t.getTime()) {
//                 // update
//                 subframe2.current = data;
//                 this.timeaxis.current.isFake = false; // always updating time.isFake
//             } else if (time.t.getTime() < data.date.getTime()) {

//                 if (this.timeaxis.current.isFake) {
//                     console.log('removecurrent');
//                     // remove fake column.
//                     // data iterator stays.
//                     // subframes stays.
//                     this.all.removeCurrent(true); // insert fake right
//                     insertedFakesRight += 1;
//                     continue;
//                 } else {
//                     console.log('move prev');
//                     // data iterator stays
//                     // subframes goes further
//                     dataIterator.movePrev(); // compensate shift
//                 }
//             } else {
//                 console.log('insert right shift');
//                 // insert after.
//                 // data iterator moves.
//                 // subframes moves.
//                 this.all.insertBeforeWithRightShiftAndSetCurrent(data.date);
//                 subframe2.current = data;
//                 this.timeaxis.current.isFake = false; // always updating time.isFake
//             }

//             if (!dataIterator.moveNext() || !this.all.moveNext()) {
//                 break;
//             }
//         }

//         // 5. If inserted to much fakes make request to new data

//         if (insertedFakesLeft > 3) {
//             this.makeRequest(-insertedFakesLeft);
//         }

//         if (insertedFakesRight > 3) {
//             this.makeRequest(insertedFakesRight);
//         }
//     }

//     // time нельзя использовать в запросах.
//     /**
//      * Changes current index.
//      * @param count 
//      */
//     private makeRequest(count: number) {

//         for (const dsUid of Object.keys(this.dsources)) {
//             const ds = this.dsources[dsUid];
//             const subframe = this.subframes[dsUid];

//             if (!ds || !subframe) { continue; }

//             if (count > 0) {    // From right
//                 // find last uid
//                 // make request

//                 if (!subframe.goToLast() || !this.timeaxis.goToLast()) {
//                     throw new Error('Cant go to end. uid=' + dsUid);
//                 } else {
//                     // find first uid from end
//                     let itemUid = '';
//                     //let time = subframe.first().date; // default
//                     let time = this.timeaxis.first().t; // default
//                     let timeIndex = 0;
//                     do {
//                         itemUid = subframe.current.uid;
//                         // TODO: make a function:
//                         if (itemUid !== '0' && itemUid !== '-1') {
//                             break;
//                         }
//                         timeIndex += 1;
//                         if (timeIndex === count) {
//                             //time = subframe.current.date;
//                             time = this.timeaxis.current.t;
//                         }
//                     } while (subframe.movePrev() && this.timeaxis.movePrev());

//                     if (itemUid && itemUid !== '0' && itemUid !== '-1') {
//                         // make request by uid
//                         console.debug(`Frame: call source uid: ${new Date(parseInt(itemUid, 10))}, count: ${count}`);
//                         const iterator = ds.getData(itemUid, (count > 0 ? this.N : -this.N)); // count); 
//                         this.mergeData(dsUid, iterator);
//                     } else {
//                         // make request by time
//                         console.debug(`Frame: call source date: ${time}, count: ${count}`);
//                         const iterator = ds.getDataByDate(time, (count > 0 ? this.N : -this.N)); //count);
//                         this.mergeData(dsUid, iterator);
//                     }
//                 }
//             } else if (count < 0) { // From left
//                 // find first uid
//                 // make request

//                 subframe.reset();
//                 this.timeaxis.reset();
//                 if (!subframe.moveNext()) {
//                     throw new Error('Cant move next. uid=' + dsUid);
//                 }

//                 // find first uid from start
//                 let itemUid = '';
//                 //let time = subframe.last().date; // default
//                 let time = this.timeaxis.last().t; // default
//                 let timeIndex = 0;
//                 do {
//                     itemUid = subframe.current.uid;
//                     // TODO: make a function:
//                     if (itemUid !== '0' && itemUid !== '-1') {
//                         break;
//                     }
//                     timeIndex -= 1;
//                     if (timeIndex === count) {
//                         //time = subframe.current.date;
//                         time = this.timeaxis.current.t;
//                     }
//                 } while (subframe.moveNext() && this.timeaxis.moveNext());

//                 if (itemUid && itemUid !== '0' && itemUid !== '-1') {
//                     // make request by uid
//                     console.debug(`Frame: call source uid: ${new Date(parseInt(itemUid, 10))}, count: ${count}`);
//                     const iterator = ds.getData(itemUid, (count > 0 ? this.N : -this.N)); //count);
//                     this.mergeData(dsUid, iterator);
//                 } else {
//                     // make request by time
//                     console.debug(`Frame: call source date: ${time}, count: ${count}`);
//                     const iterator = ds.getDataByDate(time, (count > 0 ? this.N : -this.N)); //count);
//                     this.mergeData(dsUid, iterator);
//                 }
//             }
//         }
//     }

//     public move(direction: number) {
//         if (direction === 0) {
//             return;
//         }

//         this.frameStart += (direction > 0 ? 1 : -1);

//         const Q = (this.M - this.N) / 4;

//         let insertedFakesLeft: number = 0;
//         let insertedFakesRight: number = 0;

//         if (this.frameStart < Q) {
//             // insert fakes to the beginning

//             for (let i = 0; i < Q; i += 1) {
//                 this.removeLast();
//                 this.frameStart += 1;
//                 insertedFakesLeft += 1;
//             }
//         } else if (this.frameStart > (this.N + Q) - 1) {
//             // insert fakes to the end
//             for (let i = 0; i < Q; i += 1) {
//                 this.removeFirst();
//                 this.frameStart -= 1;
//                 insertedFakesRight += 1;
//             }
//         }

//         if (insertedFakesLeft > 0) {
//             this.makeRequest(-insertedFakesLeft);
//         } else if (insertedFakesRight > 0) {
//             this.makeRequest(insertedFakesRight);
//         }
//     }

//     public contains(date: Date): boolean {
//         const t = date.getTime();
//         //const range = this.range;

//         const timeRange = this.timeaxis.getData(this.frameStart, this.N);

//         const first = timeRange[0].t;
//         const last = timeRange[(this.N > 2) ? this.N - 3 : this.N - 1].t;

//         return first.getTime() <= t && t <= last.getTime();
//     }

//     public moveTo(date: Date): void {

//         const time = date.getTime();
//         const i = this.timeaxis.indexOf(item => item.t.getTime() === time);
//         if (i !== -1) {
//             if (i < this.frameStart) {
//                 for (let j = 0; j < (this.frameStart - i); j += 1) {
//                     this.move(-1);
//                 }
//             } else if (i >= this.frameStart + this.N) {
//                 for (let j = 0; j < (i - (this.frameStart + this.N) + 1); j += 1) {
//                     this.move(1);
//                 }
//             }
//         }
//     }

//     /**
//      * Changes N value to the specified value.
//      * @param n 
//      */
//     public scaleTo(n: number): void {

//         if (n <= 1) {
//             throw new Error('Scaling to value less than 1 is unsupported.');
//         }

//         if (n === this.N) {
//             return;
//         }

//         const oldM = this.M;
//         this.N = n;
//         // TODO: Do not repeat
//         this.M = n * 3;

//         // for each subframe
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.scaleTo(this.M, () => C.CREATE_EMPTY());
//             }
//         }

//         const interval = this._interval;

//         // initialize time row
//         this.timeaxis.scaleTo(this.M, (prev?: Time, next?: Time) => {
//             const value = new Time();
//             value.isFake = true;
//             if (next) {
//                 value.t = DateUtils.substractInterval(next.t, interval);
//             } else if (prev) {
//                 value.t = DateUtils.addInterval(prev.t, interval);
//             }
//             return value;
//         });

//         // change frameStart
//         this.frameStart = Math.max(1, Math.floor((this.frameStart * this.M) / oldM));

//         console.debug('NEW framestart: ' + this.frameStart);
//         if (this.M > oldM) {
//             // send requests and merge what's there
//             // TODO: Supposed that added fakes from left
//             this.makeRequest(oldM - this.M); // < 0

//             // this.makeRequest(insertedFakesRight);
//         }
//     }


//     // TODO: Should be private
//     /*
//     *  Implementation of ISubframes
//     */

//     private get all(): ISubframes {
//         return this;
//     }

//     private framesIndex = -1;
//     public reset(): void {
//         this.framesIndex = -1;

//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.reset();
//             }
//         }
//         this.timeaxis.reset();
//     }

//     public goTo(index: number): void {
//         this.reset();

//         for (let i = 0; i <= index; i += 1) {
//             this.moveNext();
//         }
//     }

//     public moveNext(): boolean {
//         let result = true;

//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 result = result && subframe.moveNext();
//             }
//         }

//         result = result && this.timeaxis.moveNext();
//         return result;
//     }

//     public movePrev(): boolean {
//         let result = true;

//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 result = result && subframe.movePrev();
//             }
//         }

//         result = result && this.timeaxis.movePrev();
//         return result;
//     }


//     public insertAfterWithLeftShiftAndSetCurrent(date: Date): void {
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.insertAfter(C.CREATE_EMPTY());
//                 subframe.moveNext();
//             }
//         }
//         const t = new Time();
//         t.t = date;
//         t.isFake = false;
//         this.timeaxis.insertAfter(t);
//         this.timeaxis.moveNext();
//     }

//     public insertBeforeWithRightShiftAndSetCurrent(date: Date): void {
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.insertBefore(C.CREATE_EMPTY());
//                 subframe.movePrev();
//             }
//         }
//         const t = new Time();
//         t.t = date;
//         t.isFake = false;
//         this.timeaxis.insertBefore(t);
//         this.timeaxis.movePrev();
//     }

//     // current index should stay on it
//     // used when removing fakes
//     public removeCurrent(insertRight: boolean): void {
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.removeCurrent(C.CREATE_EMPTY(), insertRight);
//             }
//         }
//         const t = new Time();
//         t.isFake = true;
//         if (insertRight) {
//             //t.t = new Date(this.timeaxis.last().t.getTime() + this.intervalMs);
//             t.t = DateUtils.addInterval(this.timeaxis.last().t, this._interval);
//             console.debug(`TIME insert right ${t.t}`);
//         } else {
//             //t.t = new Date(this.timeaxis.first().t.getTime() - this.intervalMs);
//             t.t = DateUtils.substractInterval(this.timeaxis.first().t, this._interval);
//             console.debug(`TIME insert left ${t.t}`);
//         }

//         this.timeaxis.removeCurrent(t, insertRight);
//     }

//     /**
//      * inserts fakes into beginning.
//      */
//     public removeLast(): void {
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.removeLast(C.CREATE_EMPTY());
//             }
//         }
//         const t = new Time();
//         t.isFake = true;
//         //t.t = new Date(this.timeaxis.first().t.getTime() - this.intervalMs);
//         t.t = DateUtils.substractInterval(this.timeaxis.first().t, this._interval);
//         console.debug(`TIME removeLast ${t.t}`);
//         this.timeaxis.removeLast(t);
//     }

//     /**
//      * inserts fakes into ending.
//      */
//     public removeFirst(): void {
//         for (const uid of Object.keys(this.subframes)) {
//             const subframe = this.subframes[uid];
//             if (subframe) {
//                 subframe.removeFirst(C.CREATE_EMPTY());
//             }
//         }
//         const t = new Time();
//         t.isFake = true;
//         //t.t = new Date(this.timeaxis.last().t.getTime() + this.intervalMs);
//         t.t = DateUtils.addInterval(this.timeaxis.last().t, this._interval);
//         console.debug(`TIME removeFirst ${t.t}`);
//         this.timeaxis.removeFirst(t);
//     }

//     /*
//     *  End of Implementation of ISubframes
//     */

//     // TODO: Can be removed:
//     /*
//     *  Implementation of IAxis<Date>
//     */
//     // public toX(index: number): number {
//     //     const wi = this.w / this.N;
//     //     const x = (wi * index) + (wi / 2);
//     //     return x;
//     // }

//     public toValue(x: number): Date | undefined {

//         if (x >= 0 && x <= this.w) {
//             // select most nearest value

//             const wi = this.w / this.N;
//             let index = Math.floor(x / wi);
//             index = Math.min(Math.max(index, 0), this.N - 1); // 0 <= index <= (N - 1)

//             const time = this.timeaxis.getData(this.frameStart + index, 1)[0];

//             return time.t;
//         }
//     }

//     public getValuesRange(fromX: number, toX: number): IRange<Date | undefined> {
//         //if (fromX > 0 && toX > 0 && fromX < this.w && toX < this.w) {
//             return {
//                 start: this.toValue(Math.min(fromX, toX)),
//                 end: this.toValue(Math.max(fromX, toX))
//             };
//         //}
//     }

//     public get range(): IRange<Date> {

//         const timeRange = this.timeaxis.getData(this.frameStart, this.N);

//         const first = timeRange[0];
//         const last = timeRange[this.N - 1];
//         return { start: first.t, end: last.t };
//     }

//     public get interval(): TimeInterval {
//         return this._interval;
//     }

//     public set interval(value: TimeInterval) {
//         this._interval = value;

//         // Not needed as the source of time info is data source, not time axis.
//         //
//         // // Adjust scale according to the new interval if needed
//         // // Multiplying by 1 will do the work
//         // this.scaleByMultiplier(1.0);
//     }

//     public set width(value: number) {
//         this.w = value;
//     }


//     public getGrid(): (Date|undefined)[] {

//         const timeGrid = this.timeaxis.getData(this.frameStart, this.N)
//             .map((value: Time, index: number) => value.t);

//         const autoGrid = new TimeAutoGrid(this.w, this.interval, timeGrid);
//         return autoGrid.getGrid();
//     }

//     /*
//     *  End of Implementation of IAxis<Date>
//     */
// }
