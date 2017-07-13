/**
 * 
 */
import { Events, IMouse, Mouse, ObjectEventArgument, VisualComponent } from '../core/index';
import { Point } from '../shared/index';
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

    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.selectionMode = true;
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
                Events.instance.objectSelected.trigger(new ObjectEventArgument(this.hitComponent));
            }
        }
    }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {

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
                    const p = new Point(mouse.pos.x - aggregatedOffset.x, mouse.pos.y - aggregatedOffset.y);

                    if (component.isHit(p) && !hitComponent) {
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

    private last = new Point();

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        const diffX = mouse.pos.x - this.last.x;
        board.moveX(diffX);

        [this.last.x, this.last.y] = [mouse.pos.x, mouse.pos.y];
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.exit(board);
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.exit(board);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void { }

    public activate(board: IChartBoard, mouse: IMouse): void {
        [this.last.x, this.last.y] = [mouse.pos.x, mouse.pos.y];
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void {
        // TODO: stop mouse handling
    }

    private exit(board: IChartBoard): void {
        board.changeState('hover');
    }
}
