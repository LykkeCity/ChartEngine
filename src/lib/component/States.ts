/**
 * 
 */
import { Events, IMouse, Mouse, ObjectArgument, VisualComponent } from '../core/index';
import { IChartBoard, IHoverable, isEditable, ISelectable, isHoverable, isSelectable, IStateController } from './Interfaces';

export class HoverState implements IStateController {
    private static inst?: HoverState;
    protected constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new HoverState();
        }
        return this.inst;
    }

    private hitComponent?: VisualComponent;
    private selectionMode = false;
    private ignoreNextMove = false;

    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.selectionMode = true;
        this.ignoreNextMove = true;
        this.hitComponent = this.getHitComponent(board, mouse);
    }

    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        if (this.selectionMode) {
            // clear current selection
            board.forEach(component => {
                if (isSelectable(component)) {
                    component.setSelected(false);
                }
                return true; // continue
            });
        }

        // If mouse was moved do not select
        if (this.hitComponent) {
            if (isSelectable(this.hitComponent)) {
                // select component
                this.hitComponent.setSelected(true);
                Events.instance.objectSelected.trigger(new ObjectArgument(this.hitComponent));
            }
        }
    }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {

        // handle chrome behavior: click = down + move + up
        if (this.ignoreNextMove) {
            this.ignoreNextMove = false;
            return;
        }

        if (mouse.isDown && this.hitComponent) {
            if (isHoverable(this.hitComponent)) { this.hitComponent.setHovered(false); }
            if (isSelectable(this.hitComponent)) { this.hitComponent.setSelected(true); }
            // change state
            if (isEditable(this.hitComponent)) {
                const editState = this.hitComponent.getEditState();
                board.changeState(editState, { component: this.hitComponent });
            }
        } else if (mouse.isDown && !this.hitComponent) {
            board.changeState('movechart');
        } else if (!mouse.isDown) {
            const hitComponent = this.getHitComponent(board, mouse);
            if (hitComponent) {
                hitComponent.setHovered(true);
                board.setCursor('pointer');
            } else {
                board.setCursor('crosshair');
            }
        }
        this.selectionMode = false;
        this.hitComponent = undefined;
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public activate(board: IChartBoard, mouse: IMouse): void {
        this.selectionMode = false;
        this.ignoreNextMove = false;
        this.hitComponent = undefined;
        board.setCursor('crosshair');
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void {
        board.forEach(component => {
            if (isHoverable(component)) {
                component.setHovered(false);
            }
            return true; // continue
        });
    }

    private getHitComponent(board: IChartBoard, mouse: IMouse): VisualComponent & IHoverable | undefined {

        let hitComponent: VisualComponent & IHoverable | undefined;

        // traverse all hoverable components, clear all popups and find hit component.
        board.forEach(
            (component, aggregatedOffset) => {
                if (isHoverable(component)) {
                    const [localx, localy] = [mouse.x - aggregatedOffset.x, mouse.y - aggregatedOffset.y];

                    if (component.isHit(localx, localy) && !hitComponent) {
                        hitComponent = component;
                        //component.setPopupVisibility(true);
                        //return false; // do not continue
                    } else {
                        component.setHovered(false);
                    }
                }
                return true; // continue
            },
            true, // check children first
            false); // iterating in reverse order so that rendered last charts will be asked first.

        return hitComponent;
    }
}

export class MoveChartState implements IStateController {
    private static inst?: MoveChartState;
    protected constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new MoveChartState();
        }
        return this.inst;
    }

    private mouse = new Mouse();

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        const diffX = mouse.x - this.mouse.x;
        board.moveX(diffX);

        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
        this.exit(board);
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
        this.exit(board);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: IChartBoard, mouse: IMouse): void {
        //this.mouse = { ...mouse2 }; // copy
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void {
        // TODO: stop mouse handling
    }

    private exit(board: IChartBoard): void {
        board.changeState('hover');
    }
}
