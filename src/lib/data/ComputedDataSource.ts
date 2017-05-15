/**
 * ComputedDataSource class.
 */
import { AvgTrueRangeExtension } from '../compute/index';
import { AmountRange, AmountRangeOps } from '../core/index';
import { Candlestick, Uid } from '../model/index';
import { IRange } from '../shared/index';
import { ArrayDataStorage } from './ArrayDataStorage';
import { ArrayIterator } from './ArrayIterator';
import { DataChangedArgument } from './DataChangedEvent';
import { DataSource } from './DataSource';
import { DataSourceConfig } from './DataSourceConfig';
import { IDataIterator, IDataSource } from './Interfaces';

class TaskParams {
    public cuid: Uid;
    public cuidLast?: Uid;
    public count?: number;
    constructor(cuid: Uid, cuidLast?: Uid, count?: number) {
        this.cuid = cuid;
        this.cuidLast = cuidLast;
        this.count = count;
    }
}

class Request {
    public suid: Uid;
    public uidlast?: Uid;
    public count?: number;

    constructor(uid: Uid, uidlast?: Uid, count?: number) {
        this.suid = uid;
        this.uidlast = uidlast;
        this.count = count;
    }

    public isEqual(other: Request): boolean {
        // return (other
        // && this.suid.compare(other.suid) === 0
        // && this.count === other.count);

        return (other !== undefined
            && this.suid.compare(other.suid) === 0
            && (this.uidlast === other.uidlast
                || (this.uidlast !== undefined && other.uidlast !== undefined && this.uidlast.compare(other.uidlast) === 0))
            && (this.count === other.count));
    }
}

interface IDataChangedTrigger {
    (arg: DataChangedArgument): void;
}

interface ISendRequest {
    (uid: Uid, uidLast?: Uid, count?: number): void;
}

interface IComputeDelegate {
    (arg: DataChangedArgument): DataChangedArgument | undefined;
}

class ComputeTask {
    public next?: ComputeTask;

    private storage: ArrayDataStorage<Candlestick>;
    private iterator: IDataIterator<Candlestick>;
    private triggerDataChanged: IDataChangedTrigger;
    private sendrequest: ISendRequest;
    private compute: IComputeDelegate;
    private startTime: Date;
    private params: TaskParams;
    private requests: Request[] = [];
    private isFinished: boolean = false;

    public get isOutdated() {
        return ((new Date().getTime()) - this.startTime.getTime()) > (60 * 1000); // 1 min
    }

    constructor(
        storage: ArrayDataStorage<Candlestick>,
        params: TaskParams,
        datachanged: IDataChangedTrigger,
        sendrequest: ISendRequest,
        compute: IComputeDelegate,
        next?: ComputeTask) {

        this.storage = storage;
        this.iterator = storage.getIterator();
        this.triggerDataChanged = datachanged;
        this.sendrequest = sendrequest;
        this.compute = compute;
        this.startTime = new Date();
        this.next = next;
        this.params = params;

        console.log(`new ComputeTask( ${params.cuid.t.toISOString()} ${params.cuidLast ? params.cuidLast.t.toISOString() : "" } ${params.count} )`);

        if (!params.count && !params.cuidLast) {
            throw new Error('Arguments "count" and "cuidLast" not defined.');
        }
    }

    public start(): void {
        // clear timer
        this.startTime = new Date();

        console.log('----- Task.start -----');
        // Narrow load range
        if (this.params.count !== undefined && this.storage.first && this.storage.last) {
            if (this.params.cuid.compare(this.storage.first.uid) >= 0 && this.params.cuid.compare(this.storage.last.uid) <= 0) {

                let shift;
                if (this.storage.last.uid.compare(this.params.cuid) <= 0) {
                    shift = this.storage.length;
                } else {
                    this.iterator.goTo(item => true); // go to first element
                    shift = this.iterator.moveTo(item => item.uid.compare(this.params.cuid) >= 0);
                    if (shift === -1) { shift = 0; }
                }

                if (this.params.count > 0) {
                    this.params.cuid = this.storage.last.uid;
                    // Get distance b/w UID-LAST
                    this.params.count -= (this.storage.length - shift);
                    console.log(`Narrowing range: ${this.storage.last.uid.t.toISOString()} ${this.params.count}`);

                    if (this.params.count <= 0) { // change of sign 
                        this.params.count = 0;
                        this.isFinished = true;
                        return;
                    }
                } else {
                    this.params.cuid = this.storage.first.uid;
                    // Get distance b/w FIRST-UID
                    this.params.count += shift;
                    console.log(`Narrowing range: ${this.storage.first.uid.t.toISOString()} ${this.params.count}`);

                    if (this.params.count >= 0) { // change of sign 
                        this.params.count = 0;
                        this.isFinished = true;
                        return;
                    }
                }
            }
        }

        const newReqs = this.makeRequests();

        for (const newReq of newReqs) {

            // Check that requests are not repeated
            const some = this.requests.some(req => req.isEqual(newReq));

            if (!some) {
                this.requests.push(newReq);
                // Send request
                this.sendrequest(newReq.suid, newReq.uidlast, newReq.count);
            }
        }
    }

    private makeRequests(): Request[] {
        const REQ_COUNT = 500;

        if (this.storage.first && this.storage.last) {
            const M = new AmountRange(this.params.cuid, this.params.cuidLast, this.params.count);
            const S = new AmountRange(this.storage.first.uid, this.storage.last.uid, this.storage.length);

            const diff = AmountRangeOps.difference(M, S);
            if (diff) {
                return diff.map(d => {
                    //-----------------------------------------------
                    let count = d.count;
                    if (d.count !== undefined) {
                        count = d.count > 0 ? REQ_COUNT : -REQ_COUNT; // extending to REQ_COUNT
                    }
                    //-----------------------------------------------
                    return new Request(d.uidStart, d.uidEnd, count);
                });
            } else {
                return [];
            }
        } else {
            return [
                new Request(this.params.cuid, undefined, REQ_COUNT)
            ];
        }

        // // Make request
        // let cuidRequest: Uid;
        // let countRequest: number;

        // if (this.params.count !== undefined) {
        //     if (this.params.count > 0) {
        //         cuidRequest = (this.storage.last !== undefined) ? this.storage.last.uid : this.params.cuid;
        //         countRequest = REQ_COUNT;
        //     } else if (this.params.count < 0) {
        //         cuidRequest = (this.storage.first !== undefined) ? this.storage.first.uid : this.params.cuid;
        //         countRequest = -REQ_COUNT;
        //     } else {
        //         this.isFinished = true;
        //         return;
        //     }
        // } else if (this.params.cuidLast !== undefined) {
        //     // get last uid
        //     cuidRequest = (this.storage.last !== undefined) ? this.storage.last.uid : this.params.cuid;
        //     countRequest = REQ_COUNT;
        // } else {
        //     throw new Error('Arguments "count" and "cuidLast" not defined.');
        // }
    }

    private computeAndTriggerEvent(arg: DataChangedArgument): void {

        const argres = this.compute(arg);
        if (argres) {
            this.triggerDataChanged(argres);
        }
    }

    private isArgRelated(arg: DataChangedArgument) {

        const M = new AmountRange(arg.uidFirst, arg.uidLast, arg.count);
        const S = new AmountRange(this.params.cuid, this.params.cuidLast, this.params.count);

        return AmountRangeOps.isIntersected(M, S);

        // const argFirstTime = arg.uidFirst.t.getTime();
        // const argLastTime = arg.uidLast.t.getTime();
        // const cuidTime = this.params.cuid.t.getTime();

        // if (this.params.cuidLast !== undefined) {
        //     // Checking if at least one time is inside interval
        //     const cuidLastTime = this.params.cuidLast.t.getTime();

        //     return ((argFirstTime >= cuidTime && argFirstTime <= cuidLastTime)
        //     || (argLastTime >= cuidTime && argLastTime <= cuidLastTime));

        // } else if (this.params.count !== undefined) {
        //     // Check if one of incoming Uid is on the right side
        //     if (this.params.count > 0) {
        //         return argLastTime >= cuidTime;
        //     } else if (this.params.count < 0) {
        //         return argFirstTime <= cuidTime;
        //     }
        // } else {
        //     throw new Error('Arguments "count" and "cuidLast" not defined.');
        // }
        // return false;
    }

    private checkIfDataEnough(params: TaskParams) {

        // TODO: There can be no exact Uid. Use gt/lt comparing
        if (this.iterator.goTo(item => item.uid.compare(this.params.cuid) === 0)) {
            if (this.params.count !== undefined) {
                return (this.iterator.moveTimes(this.params.count) === this.params.count);
            } else if (this.params.cuidLast !== undefined) {
                // There can be no exact Uid
                return this.iterator.moveTo(item => item.uid.compare(this.params.cuid) >= 0);
            } else {
                throw new Error('Arguments "count" and "cuidLast" not defined.');
            }
        }
    }

    public handleEvent(arg: DataChangedArgument, sourceIterator: IDataIterator<Candlestick>) {

        // if (this.isFinished) {
        //     if (this.next) {
        //         this.next.handleEvent(arg, sourceIterator);
        //     }
        //     return;
        // }

        // Check if data is related to this task
        const related = this.isArgRelated(arg);

        console.log('----- Task.handleEvent -----');
        console.log(`arg ${ arg.uidFirst.t.toISOString() } - ${ arg.uidLast.t.toISOString() } `);
        console.log(`params ${ this.params.cuid.t.toISOString() } - ${ this.params.cuidLast ? this.params.cuidLast.t.toISOString() : "N/A" } / ${ this.params.count } `);
        console.log('Related: ' + related);

        if (!related && this.next) {
            // If not - pass it further
            this.next.handleEvent(arg, sourceIterator);
            return;
        }

        // If yes
        // Compute values
        this.computeAndTriggerEvent(arg);

        if (!related) {
            // do not send requests
            return;
        }

        // Recheck data.
        if (this.checkIfDataEnough(this.params)) {
            console.log('task is finished');
            // If data is enough, finish.
            this.isFinished = true;
        } else {
            // If data is not enough
            // send one more request

            // clear timer
            this.startTime = new Date();
            this.start();
        }
    }
}

export abstract class ComputedDataSource<S extends Candlestick> extends DataSource {
    protected source: IDataSource<Candlestick>;
    protected sourceIterator: IDataIterator<Candlestick>;
    protected dataStorage: ArrayDataStorage<S>;
    protected iterator: IDataIterator<S>;
    private task?: ComputeTask;

    constructor (source: IDataSource<Candlestick>) {
        super(Candlestick, new DataSourceConfig());
        this.dataStorage = new ArrayDataStorage<S>(this.comparer);
        this.iterator = this.dataStorage.getIterator();
        this.source = source;
        this.source.dataChanged.on(this.onDataSourceChanged);
        this.sourceIterator = source.getIterator();
    }

    private comparer = (lhs: S, rhs: S) => { return lhs.uid.compare(rhs.uid); };

    public getIterator(): IDataIterator<Candlestick> {
        return this.dataStorage.getIterator();
    }

    public load(uid: Uid, count: number): void {
        if (!uid || count === 0) {
            return;
        }

        console.log(`CDS.load ${ uid.t.toISOString() } / ${ count } `);

        if (this.iterator.goTo(item => item.uid.compare(uid) === 0)) {
            if (this.iterator.moveTimes(count) === count) {
                // data already loaded
                return;
            }
        }

        const params = new TaskParams(uid, undefined, count);
        this.task = new ComputeTask(this.dataStorage, params, this.triggerDataChanged, this.sendDataRequest,
                                    this.computeDelegate, this.task);
        this.task.start();
    }

    public loadRange(uidFirst: Uid, uidLast: Uid): void {
        if (!uidFirst || !uidLast || uidFirst.compare(uidLast) === 0) {
            return;
        }

        console.log(`CDS.load ${ uidFirst.t.toISOString() } / ${ uidLast.t.toISOString() } `);

        // sort arguments
        if (uidFirst.compare(uidLast) > 0) {
            const temp = uidFirst;
            uidFirst = uidLast;
            uidLast = temp;
        }

        // TODO: There can be no exact Uid. Use gt/lt comparing
        if (this.iterator.goTo(item => item.uid.compare(uidFirst) === 0)) {
            if (this.iterator.moveTo(item => item.uid.compare(uidLast) >= 0)) {
                // data already loaded
                return;
            }
        }
        // const params = new TaskParams(uidFirst, uidLast);
        // this.task = new ComputeTask(this.dataStorage, params, this.triggerDataChanged, this.sendDataRequest, 
        //                             this.computeDelegate, this.task);
        this.task = this.createTask(uidFirst, uidLast, undefined, this.task);
        this.task.start();
    }

    protected triggerDataChanged = (arg: DataChangedArgument) => {
        this.dateChangedEvent.trigger(arg);
    }

    protected sendDataRequest = (uid: Uid, uidLast?: Uid, count?: number): void => {
        console.log(`Sending request: ${uid.t.toISOString()} ${count}`);
        if (uidLast) {
            this.source.loadRange(uid, uidLast);
        } else if (count) {
            this.source.load(uid, count);
        } else {
            throw new Error('uid or count must be defined.')
        }
    }

    protected onDataSourceChanged = (arg: DataChangedArgument) => {

        console.log('============ STARTING TASKS CHAIN ============================');

        // Pass result to the tasks
        if (this.task) {

            this.task.handleEvent(arg, this.sourceIterator);

            // Remove "outdated" tasks
            if (this.task.isOutdated) {
                this.task = undefined;
            } else {
                let current = this.task;
                while (current.next && !current.next.isOutdated) { current = current.next; }
                current.next = undefined;
            }
        } else {
            // If not current task then create a new task
            this.task = this.createTask(arg.uidFirst, arg.uidLast, arg.count);
            this.task.handleEvent(arg, this.sourceIterator);
            //this.task.start();
        }
    }

    private createTask(uidFirst: Uid, uidLast?: Uid, count?: number, nextTask?: ComputeTask): ComputeTask {
        const params = new TaskParams(uidFirst, uidLast, count);
        return new ComputeTask(this.dataStorage, params, this.triggerDataChanged, this.sendDataRequest,
                               this.computeDelegate, nextTask);
    }

    private computeDelegate = (arg: DataChangedArgument) => {
        return this.compute(arg);
    }

    protected abstract compute(arg?: DataChangedArgument): DataChangedArgument | undefined;

    protected getDefaultConfig(): DataSourceConfig {
        return new DataSourceConfig();
    }

    public lock(uid: Uid): void { }

    public dispose(): void {
        this.source.dataChanged.off(this.onDataSourceChanged);
    }
}
