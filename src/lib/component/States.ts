/**
 * 
 */
import { Events, IMouse, ITouch, Mouse, ObjectEventArgument, VisualComponent } from '../core/index';
import { IPoint, Point } from '../shared/index';
import { IChartBoard, IHoverable, isEditable, ISelectable, isHoverable, isSelectable, IStateController } from './Interfaces';

export class HoverState implements IStateController {
    public constructor() { }

    private hitComponent?: VisualComponent;
    private selectionMode = false;

    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.selectionMode = true;
        this.hitComponent = this.getHitComponent(board, mouse.pos);
    }

    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        if (this.selectionMode) {
            this.clearSelection(board);
        }

        // If mouse was moved do not select
        board.select(this.hitComponent);
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
        } else if (mouse.isDown && !this.hitComponent) { // Using pan event instead
            board.changeState('movechart');
        } else if (!mouse.isDown) {
            const hitComponent = this.getHitComponent(board, mouse.pos);
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

    public onTouchPan(board: IChartBoard, touch: ITouch): void {

        // if selected component
        //      edit figure
        // if nothing selected
        //      movechart

        const [selectedComponent, offset] = this.getSelectedComponent(board);
        if (selectedComponent && offset && isHoverable(selectedComponent) && isEditable(selectedComponent)) {
            const p = new Point(touch.center.x - offset.x, touch.center.y - offset.y);
            if (selectedComponent.isHit(p)) {
                const editState = selectedComponent.getEditState();
                board.changeState(editState, { component: selectedComponent });
            }
        } else {
            board.changeState('movechart');
        }
    }

    public onTouchTap(board: IChartBoard, touch: ITouch): void {
        // 1. clear selection
        this.clearSelection(board);

        // 2. get hit component
        this.hitComponent = this.getHitComponent(board, touch.center);

        // 3. select component
        board.select(this.hitComponent);
    }

    public onTouchPress(board: IChartBoard, touch: ITouch): void { }
    public onTouchSwipe(board: IChartBoard, touch: ITouch): void { }

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

    private clearSelection(board: IChartBoard) {
        // clear current selection
        board.forEach(component => {
            if (isSelectable(component)) {
                component.setSelected(false);
            }
            return true; // continue
        });
    }

    private getHitComponent(board: IChartBoard, hitpoint: IPoint): VisualComponent & IHoverable | undefined {

        let hitComponent: VisualComponent & IHoverable | undefined;

        // traverse all hoverable components, clear all popups and find hit component.
        board.forEach(
            (component, aggregatedOffset) => {
                if (isHoverable(component)) {
                    const p = new Point(hitpoint.x - aggregatedOffset.x, hitpoint.y - aggregatedOffset.y);

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

    private getSelectedComponent(board: IChartBoard): [VisualComponent & ISelectable | undefined, IPoint|undefined] {

        let selectedComponent: VisualComponent & ISelectable | undefined;
        let offset: IPoint | undefined;

        // traverse all components and find selected component.
        board.forEach((component, aggregatedOffset) => {
            if (isSelectable(component)) {
                if (component.getSelected()) {
                    selectedComponent = component;
                    offset = aggregatedOffset;
                    return false; // stop iterating
                }
            }
            return true; // continue
        });

        return [selectedComponent, offset];
    }
}

export class MoveChartState implements IStateController {
    public constructor() { }

    private lastMouse = new Point();
    private lastTouch?: Point;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }
    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.exit(board);
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.exit(board);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        const diffX = mouse.pos.x - this.lastMouse.x;
        board.moveX(diffX);

        [this.lastMouse.x, this.lastMouse.y] = [mouse.pos.x, mouse.pos.y];
    }

    public onTouchPan(board: IChartBoard, touch: ITouch): void {

        if (this.lastTouch) {
            const diffX = touch.center.x - this.lastTouch.x;
            board.moveX(diffX);
            [this.lastTouch.x, this.lastTouch.y] = [touch.center.x, touch.center.y];
        } else {
            this.lastTouch = new Point(touch.center.x, touch.center.y);
        }

        if (touch.isFinal) {
            this.exit(board);
        }
    }

    public onTouchPress(board: IChartBoard, touch: ITouch): void { }
    public onTouchSwipe(board: IChartBoard, touch: ITouch): void { }
    public onTouchTap(board: IChartBoard, touch: ITouch): void { }

    public activate(board: IChartBoard, mouse: IMouse): void {
        [this.lastMouse.x, this.lastMouse.y] = [mouse.pos.x, mouse.pos.y];
        this.lastTouch = undefined;
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard): void {
        board.changeState('hover');
    }
}
