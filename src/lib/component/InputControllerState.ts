/**
 * 
 */
import { IMouse, Mouse, VisualComponent } from '../core/index';
import { IChartBoard, IHoverable, isEditable, isHoverable, IStateController } from './Interfaces';

export class HoverState implements IStateController {
    private static inst?: HoverState;
    protected constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new HoverState();
        }
        return this.inst;
    }

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }
    public onMouseMove(board: IChartBoard, mouse: IMouse): void {

        const hitComponent = this.getHitComponent(board, mouse);

        if (hitComponent) {
            hitComponent.setPopupVisibility(true);
        }
    }
    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void { }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {

        const hitComponent = this.getHitComponent(board, mouse);

        if (hitComponent) {
            // edit element
            //const editState = this.getEditState(hitComponent);
            if (isEditable(hitComponent)) {
            //if (editState) {
                hitComponent.setPopupVisibility(false);

                const editState = hitComponent.getEditState();
                board.changeState(editState, { component: hitComponent });
            }
        } else {
            board.changeState('movechart');
        }
    }

    public activate(board: IChartBoard, mouse: IMouse): void { }

    public deactivate(board: IChartBoard, mouse: IMouse): void {
        // traverse all hoverable components and show popup

        board.forEach(component => {
            if (isHoverable(component)) {
                component.setPopupVisibility(false);
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
                        component.setPopupVisibility(false);
                    }
                }
                return true; // continue
            },
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
