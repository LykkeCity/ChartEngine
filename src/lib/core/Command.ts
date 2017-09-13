/**
 * Command class
 */
import { Action, ICommand } from '../core/index';

export class Command implements ICommand {
    private _exec: Action;
    private _undo: Action;
    private isExecuted = false;
    private isUndone = false;

    constructor(exec: Action, undo: Action) {
        this._exec = exec;
        this._undo = undo;
    }

    public execute(): ICommand {
        if (!this.isExecuted) {
            this._exec();
            this.isExecuted = true;
            return this;
        } else {
            throw new Error('Command is already executed');
        }
    }

    public undo(): void {
        if (!this.isUndone) {
            this._undo();
            this.isUndone = true;
        } else {
            throw new Error('Command is already undone');
        }
    }
}
