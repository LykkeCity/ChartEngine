/**
 * PopupViewModel class.
 */
import * as lychart from '../../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import IEvent = lychart.shared.IEvent;
import Event = lychart.shared.Event;
import SettingSet = lychart.core.SettingSet;
import SettingType = lychart.core.SettingType;
import VisualComponent = lychart.core.VisualComponent;

/**
 * View model for popup dialog.
 */
export class PopupViewModel {
    public visible = ko.observable(false);
    public vmUid = ko.observable();

    private obj: any;

    constructor(
        private container: HTMLElement,
        private board: ChartBoard) {
            const rand = Math.random();
            this.vmUid(rand);
            console.log('PopupViewModel ctor: ' + rand);
    }

    public cmdMoveUp(): void {
        if (this.obj) {
            this.board.moveUp(this.obj.uid);
        }
    }

    public cmdMoveDown(): void {
        if (this.obj) {
            this.board.moveDown(this.obj.uid);
        }
    }

    public cmdRemove(): void {
        if (this.obj) {
            this.board.removeObject(this.obj.uid);
            this.visible(false);
        }
    }

    public rebuild(obj: any): void {
        this.obj = obj;
    }
}
