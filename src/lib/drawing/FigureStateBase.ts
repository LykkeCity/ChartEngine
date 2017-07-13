/**
 * FigureStateBase class.
 */
import { IChartBoard, IChartStack, IStateController } from '../component/index';
import { IMouse } from '../core/index';
import { IHashTable } from '../shared/index';

export abstract class FigureStateBase implements IStateController {
    constructor() { }

    private chartStack?: IChartStack;
    private state = 0;  // current state
                        // 0 - initial
                        // 1 - selecting point
                        // 2 - drawing line

    public onMouseDown(board: IChartBoard, mouse: IMouse, stack?: IChartStack): void {
        if (this.state === 0) {
            // add first point and fix it
            this.addPoint(mouse);
            this.fixPoint(mouse);
            this.state = 1;
        } else if (this.state === 1) {
            // ignore
        } else if (this.state === 2) {
            // fix last point = finish line
            this.fixPoint(mouse);
            this.state = 1;
        }
    }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.state === 0) {
            // hovering
        } else if (this.state === 1) {
            // fix last point
            this.fixPoint(mouse);
            // add new point = start drawing line
            this.addPoint(mouse);
            this.state = 2;
        } else if (this.state === 2) {
            // change last point
            this.setLastPoint(mouse);
        }
    }

    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        if (this.state === 0) {
            // ignore
        } else if (this.state === 1) {
            // point is selected
            //fix last point
            this.fixPoint(mouse);
            //add new point = start drawing line

            // this.addPoint(mouse);
            // this.state = 2;
        } else if (this.state === 2) {
            // line is drawn. Add new point and go
            //fix last point
            this.fixPoint(mouse);
            //add new point = start drawing line

            this.state = 1; // start another line
            //this.addPoint(mouse);
            //this.state = 2; // start another line
        }
    }

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }
    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
        this.state = 0;
    }
    public deactivate(): void { }

    protected abstract addPoint(mouse: IMouse): void;
    protected fixPoint(mouse: IMouse): void {};
    protected abstract setLastPoint(mouse: IMouse): void;
}

// export abstract class FigureStateBase implements IStateController {
//     constructor() { }

//     private chartStack?: IChartStack;
//     private state = 0;  // current state
//                         // 0 - initial
//                         // 1 - selecting point
//                         // 2 - drawing line

//     public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }
//     public onMouseMove(board: IChartBoard, mouse: IMouse): void {
//         if (this.state === 0) {
//             // hovering
//         } else if (this.state === 1) {
//             // fix last point
//             // add new point = start drawing line
//             this.addPoint(mouse);
//             this.state = 2;
//         } else if (this.state === 2) {
//             // change last point
//             this.setLastPoint(mouse);
//         }
//     }

//     public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
//     public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
//     public onMouseUp(board: IChartBoard, mouse: IMouse): void {
//         if (this.state === 0) {
//             // ignore
//         } else if (this.state === 1) {
//             // point is selected
//             //fix last point
//             //add new point = start drawing line
//             this.addPoint(mouse);
//             this.state = 2;
//         } else if (this.state === 2) {
//             // line is drawn. Add new point and go
//             //fix last point
//             //add new point = start drawing line
//             this.addPoint(mouse);
//             this.state = 2; // start another line
//         }
//     }
//     public onMouseDown(board: IChartBoard, mouse: IMouse, stack?: IChartStack): void {
//         if (this.state === 0) {
//             // add first point
//             this.addPoint(mouse);
//             this.state = 1;
//         } else if (this.state === 1) {
//             // ignore
//         } else if (this.state === 2) {
//             // fix last point = finish line
//             this.state = 1;
//         }
//     }

//     public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void {
//         this.state = 0;
//     }
//     public deactivate(): void { }

//     protected abstract addPoint(mouse: IMouse): void;
//     protected abstract setLastPoint(mouse: IMouse): void;
// }
