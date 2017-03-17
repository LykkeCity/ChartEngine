/**
 * 
 */
import { isHoverable } from '../core';
import { ChartBoard } from './ChartBoard';

export interface IMouse {
    x: number;
    y: number;
    isDown: boolean;
    isEntered: boolean;
}

export class Mouse implements IMouse {
    public x: number = 0;
    public y: number = 0;
    public isDown: boolean = false;
    public isEntered: boolean = false;
}

export abstract class InputControllerState {
    public abstract onMouseWheel(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseMove(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseEnter(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseLeave(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseUp(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseDown(board: ChartBoard, mouse: IMouse): void;
    protected changeState(board: ChartBoard, state: InputControllerState) {
        board.changeState(state);
    }
    public abstract activate(board: ChartBoard, mouse: IMouse): void;
    public abstract deactivate(board: ChartBoard, mouse: IMouse): void;
}

export class States {
    private static _hoverState: HoverState;

    public static get hoverState(): InputControllerState {
        if (this._hoverState == null) {
            this._hoverState = new HoverState();
        }
        return this._hoverState;
    }

    private static _moveChartState: MoveChartState;

    public static get moveChartState(): InputControllerState {
        if (this._moveChartState == null) {
            this._moveChartState = new MoveChartState();
        }
        return this._moveChartState;
    }
}

class HoverState extends InputControllerState {

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void { }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {

        // traverse all hoverable components and show popup
        board.forEach(
            (component, aggregatedOffset) => {
                if (isHoverable(component)) {
                    const [localx, localy] = [mouse.x - aggregatedOffset.x, mouse.y - aggregatedOffset.y];

                    if (component.isHit(localx, localy)) {
                        component.setPopupVisibility(true);
                        return false; // do not continue
                    } else {
                        component.setPopupVisibility(false);
                    }
                }
                return true; // continue
            },
            false); // iterating in reverse order so that rendered last charts will be asked first.
    }
    public onMouseEnter(board: ChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: ChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: ChartBoard, mouse: IMouse): void { }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.changeState(board, States.moveChartState);
    }
    public activate(board: ChartBoard, mouse: IMouse): void {
    }
    public deactivate(board: ChartBoard, mouse: IMouse): void {
        // traverse all hoverable components and show popup
        board.forEach(component => {
            if (isHoverable(component)) {
                component.setPopupVisibility(false);
            }
            return true; // continue
        });
    }
}

class MoveChartState extends InputControllerState {
    private mouse = new Mouse();

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void {
    }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {
        const diffX = mouse.x - this.mouse.x;
        board.moveX(diffX);

        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];
    }

    public onMouseEnter(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
        this.exit(board);
    }
    public onMouseUp(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
        this.exit(board);
    }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: ChartBoard, mouse: IMouse): void {
        //this.mouse = { ...mouse2 }; // copy
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];
    }

    public deactivate(board: ChartBoard, mouse: IMouse): void {
        // TODO: stop mouse handling
    }

    private exit(board: ChartBoard): void {
        this.changeState(board, States.hoverState);
    }
}

class DrawLineState extends InputControllerState {
    private mouse = new Mouse();
    private 

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void {
    }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];


    }

    public onMouseEnter(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    }
    public onMouseUp(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
    }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;

        // Determine which ChartStack was hit

        const line = chartStack.addLine();

        // 
    }

    public activate(board: ChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];
    }

    public deactivate(board: ChartBoard, mouse: IMouse): void {
    }
}
