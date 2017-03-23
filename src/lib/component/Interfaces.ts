/**
 * 
 */
import { ChartPoint, IAxis, IMouse, IPoint, VisualComponent } from '../core/index';
import { Area } from '../layout/index';
import { IHashTable, ISize } from '../shared/index';
import { FigureComponent } from './FigureComponent';

export interface IDrawing {
    start(figureId: string): void;
    cancel(): void;
}

export interface IHoverable {
    isHit(mouseX: number, mouseY: number): boolean;
    // TODO: Change name. It shows not only popups, but can also change component's view
    setPopupVisibility(visible: boolean): void;
}

export function isHoverable(obj: any): obj is IHoverable {
    return (<IHoverable>obj).isHit !== undefined
     && (<IHoverable>obj).setPopupVisibility !== undefined;
}

export interface IEditable {
    getEditState(): IStateController;
}

export function isEditable(obj: any): obj is IEditable {
    return (<IEditable>obj).getEditState !== undefined;
}

export interface IChartBoard {
    offset: IPoint;
    changeState(state: string | IStateController, activationParameters?: IHashTable<any>): void;
    forEach(delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void }, directOrder?: boolean): boolean;
    getHitStack(mouseX: number, mouseY: number): IChartStack | undefined;
    moveX(shift: number): void;
}

export interface IChartStack {
    offset: IPoint;
    addFigure(ctor: {(area: Area, offset: IPoint, size: ISize, timeAxis: IAxis<Date>, yAxis: IAxis<number>): FigureComponent}) : FigureComponent;
    mouseToCoords(mouseX: number, mouseY: number): ChartPoint;
}

export interface IStateController {
    activate(board: IChartBoard, mouse: IMouse, parameters?: IHashTable<any>): void;
    deactivate(board: IChartBoard, mouse: IMouse): void;

    onMouseWheel(board: IChartBoard, mouse: IMouse): void;
    onMouseMove(board: IChartBoard, mouse: IMouse): void;
    onMouseEnter(board: IChartBoard, mouse: IMouse): void;
    onMouseLeave(board: IChartBoard, mouse: IMouse): void;
    onMouseUp(board: IChartBoard, mouse: IMouse): void;
    onMouseDown(board: IChartBoard, mouse: IMouse): void;
}

export function isStateController(obj: any): obj is IStateController {
    return (<IStateController>obj).activate !== undefined
        && (<IStateController>obj).deactivate !== undefined;
}