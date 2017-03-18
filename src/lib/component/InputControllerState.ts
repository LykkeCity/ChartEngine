/**
 * 
 */
import { ChartPoint, IHoverable, isHoverable, VisualComponent } from '../core/index';
import { IHashTable, IPoint } from '../shared/index';
import { ChartBoard } from './ChartBoard';
import { ChartStack } from './ChartStack';
import { LineFigureComponent, PointFigureComponent } from './Figures';

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

// export interface IEditable {
//     getEditState(): InputControllerState;
// }

// export function isEditable(obj: any): obj is IEditable {
//     return (<IEditable>obj).getEditState !== undefined;
// }


export abstract class InputControllerState {
    public abstract onMouseWheel(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseMove(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseEnter(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseLeave(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseUp(board: ChartBoard, mouse: IMouse): void;
    public abstract onMouseDown(board: ChartBoard, mouse: IMouse): void;
    protected changeState(board: ChartBoard, state: InputControllerState, activationParameters?: IHashTable<any>) {
        board.changeState(state, activationParameters);
    }
    public abstract activate(board: ChartBoard, mouse: IMouse, parameters?: IHashTable<any>): void;
    public abstract deactivate(board: ChartBoard, mouse: IMouse): void;
}

export class States {
    private static hoverState: HoverState;

    public static get hover(): InputControllerState {
        if (this.hoverState == null) {
            this.hoverState = new HoverState();
        }
        return this.hoverState;
    }

    private static moveChartState: MoveChartState;

    public static get moveChart(): InputControllerState {
        if (this.moveChartState == null) {
            this.moveChartState = new MoveChartState();
        }
        return this.moveChartState;
    }

    private static drawLineState: DrawLineState;
    public static get drawLine(): InputControllerState {
        if (this.drawLineState == null) {
            this.drawLineState = new DrawLineState();
        }
        return this.drawLineState;
    }

    private static editLineState: EditLineState;
    public static get editLine(): InputControllerState {
        if (this.editLineState == null) {
            this.editLineState = new EditLineState();
        }
        return this.editLineState;
    }

    private static editPointState: EditPointState;
    public static get editPoint(): InputControllerState {
        if (this.editPointState == null) {
            this.editPointState = new EditPointState();
        }
        return this.editPointState;
    }
}

class HoverState extends InputControllerState {

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void { }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {

        const hitComponent = this.getHitComponent(board, mouse);

        if (hitComponent) {
            hitComponent.setPopupVisibility(true);
        }
    }
    public onMouseEnter(board: ChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: ChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: ChartBoard, mouse: IMouse): void { }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {

        const hitComponent = this.getHitComponent(board, mouse);

        if (hitComponent) {
            // edit element
            const editState = this.getEditState(hitComponent);
            //if (isEditable(hitComponent)) {
            if (editState) {
                hitComponent.setPopupVisibility(false);

                //const editState = hitComponent.getEditState();
                this.changeState(board, editState, { component: hitComponent });
            }
        } else {
            this.changeState(board, States.moveChart);
        }
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

    private getHitComponent(board: ChartBoard, mouse: IMouse): VisualComponent & IHoverable | undefined {

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

    private getEditState(component: VisualComponent): InputControllerState | undefined {
        if (component instanceof LineFigureComponent) {
            return States.editLine;
        } else if (component instanceof PointFigureComponent) {
            return States.editPoint;
        }
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
        this.changeState(board, States.hover);
    }
}

class DrawLineState extends InputControllerState {
    private mouse = new Mouse();
    private chartStack?: ChartStack;
    private line?: LineFigureComponent;

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void {
    }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {
        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);
        [this.mouse.x, this.mouse.y] = [adjPoint.x, adjPoint.y];

        if (this.line && this.chartStack) {
            const timeNumberCoords = this.chartStack.mouseToCoords(this.mouse.x, this.mouse.y);

            if (timeNumberCoords.t && timeNumberCoords.v) {
                this.line.pointB.t = timeNumberCoords.t;
                this.line.pointB.v = timeNumberCoords.v;
            }
        }
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
        this.line = undefined;
        this.chartStack = undefined;
        this.exit(board, mouse);
    }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;

        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);
        [this.mouse.x, this.mouse.y] = [adjPoint.x, adjPoint.y];

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x, mouse.y);
        if (this.chartStack) {
            this.line = this.chartStack.addLine();

            const timeNumberCoords = this.chartStack.mouseToCoords(this.mouse.x, this.mouse.y);

            this.line.pointA.t = timeNumberCoords.t;
            this.line.pointA.v = timeNumberCoords.v;

            this.line.pointB.t = timeNumberCoords.t;
            this.line.pointB.v = timeNumberCoords.v;
        }
    }

    public activate(board: ChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];


    }

    public deactivate(board: ChartBoard, mouse: IMouse): void {
    }

    private exit(board: ChartBoard, mouse: IMouse): void {
        this.changeState(board, States.hover);
    }

    private adjustMouseCoords(board: ChartBoard, x: number, y: number) : IPoint {
        return { x: x - board.offset.x, y: y - board.offset.y };
    }
}

class EditLineState extends InputControllerState {
    private mouse = new Mouse();
    private chartStack?: ChartStack;
    private line?: LineFigureComponent;
    private currentCoords?: ChartPoint;

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void {
    }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {
        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);

        if (this.line && this.chartStack) {
            const timeNumberCoords = this.chartStack.mouseToCoords(adjPoint.x, adjPoint.y);

            // Calculate difference
            // TODO: Get rid of excessive check for undefined values
            if (timeNumberCoords.t && timeNumberCoords.v
                && this.currentCoords && this.currentCoords.t && this.currentCoords.v
                && this.line.pointA.t && this.line.pointA.v && this.line.pointB.t && this.line.pointB.v) {

                const tdiff = timeNumberCoords.t.getTime() - this.currentCoords.t.getTime();
                const vdiff = timeNumberCoords.v - this.currentCoords.v;

                this.line.pointA.t = new Date(this.line.pointA.t.getTime() + tdiff);
                this.line.pointA.v = this.line.pointA.v + vdiff;

                this.line.pointB.t = new Date(this.line.pointB.t.getTime() + tdiff);
                this.line.pointB.v = this.line.pointB.v + vdiff;

                this.currentCoords = timeNumberCoords;
            }
        } else {
            console.debug('Edit state: line or chartStack is not found.');
        }

        [this.mouse.x, this.mouse.y] = [adjPoint.x, adjPoint.y];
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
        this.exit(board, mouse);
    }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: ChartBoard, mouse: IMouse, activationParameters?: IHashTable<any>): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];

        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x, mouse.y);
        if (this.chartStack) {
            this.currentCoords = this.chartStack.mouseToCoords(adjPoint.x, adjPoint.y);
        } else {
            throw new Error('Can not find hit chart stack.');
        }

        if (activationParameters && activationParameters['component']) {
            this.line = <LineFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: ChartBoard, mouse: IMouse): void {
    }

    private exit(board: ChartBoard, mouse: IMouse): void {
        this.line = undefined;
        this.chartStack = undefined;
        this.changeState(board, States.hover);
    }

    private adjustMouseCoords(board: ChartBoard, x: number, y: number) : IPoint {
        return { x: x - board.offset.x, y: y - board.offset.y };
    }
}

class EditPointState extends InputControllerState {
    private mouse = new Mouse();
    private chartStack?: ChartStack;
    private point?: PointFigureComponent;
    private currentCoords?: ChartPoint;

    public onMouseWheel(board: ChartBoard, mouse: IMouse): void {
    }
    public onMouseMove(board: ChartBoard, mouse: IMouse): void {
        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);

        if (this.point && this.chartStack) {
            const timeNumberCoords = this.chartStack.mouseToCoords(adjPoint.x, adjPoint.y);

            // Calculate difference
            // TODO: Get rid of excessive check for undefined values
            if (timeNumberCoords.t && timeNumberCoords.v
                && this.currentCoords && this.currentCoords.t && this.currentCoords.v
                && this.point.point.t && this.point.point.v) {

                const tdiff = timeNumberCoords.t.getTime() - this.currentCoords.t.getTime();
                const vdiff = timeNumberCoords.v - this.currentCoords.v;

                this.point.point.t = new Date(this.point.point.t.getTime() + tdiff);
                this.point.point.v = this.point.point.v + vdiff;

                this.currentCoords = timeNumberCoords;
            }
        } else {
            console.debug('Edit state: line or chartStack is not found.');
        }

        [this.mouse.x, this.mouse.y] = [adjPoint.x, adjPoint.y];
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
        this.exit(board, mouse);
    }
    public onMouseDown(board: ChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: ChartBoard, mouse: IMouse, activationParameters?: IHashTable<any>): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];

        const adjPoint = this.adjustMouseCoords(board, mouse.x, mouse.y);

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x, mouse.y);
        if (this.chartStack) {
            this.currentCoords = this.chartStack.mouseToCoords(adjPoint.x, adjPoint.y);
        } else {
            throw new Error('Can not find hit chart stack.');
        }

        if (activationParameters && activationParameters['component']) {
            this.point = <PointFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: ChartBoard, mouse: IMouse): void {
    }

    private exit(board: ChartBoard, mouse: IMouse): void {
        this.point = undefined;
        this.chartStack = undefined;
        this.changeState(board, States.hover);
    }

    private adjustMouseCoords(board: ChartBoard, x: number, y: number) : IPoint {
        return { x: x - board.offset.x, y: y - board.offset.y };
    }
}
