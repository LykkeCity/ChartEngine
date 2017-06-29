/**
 * 
 */
import { ChartPoint, IAxis, ICoordsConverter, IMouse, IPoint, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, VisualComponent } from '../core/index';
import { Area, ChartArea } from '../layout/index';
import { IHashTable, ISize } from '../shared/index';
import { FigureComponent } from './FigureComponent';

export interface IDrawing {
    start(figureId: string): void;
    cancel(): void;
}

export interface ISelectable {
    setSelected(selected: boolean): void;
}

export function isSelectable(obj: any): obj is ISelectable {
    return (<ISelectable>obj).setSelected !== undefined;
}

export interface IHoverable {
    isHit(mouseX: number, mouseY: number): boolean;
    setHovered(hovered: boolean): void;
}

export function isHoverable(obj: any): obj is IHoverable {
    return (<IHoverable>obj).isHit !== undefined
     && (<IHoverable>obj).setHovered !== undefined;
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
    forEach(delegate: {(component: VisualComponent, aggregatedOffset: IPoint): void }, childrenFirst?: boolean, directOrder?: boolean): void;
    getHitStack(mouseX: number, mouseY: number): IChartStack | undefined;
    moveX(shift: number): void;
    setCursor(style: string): void;
}

export interface IChartStack extends ICoordsConverter {
    uid: string;
    offset: IPoint;
    addFigure(ctor: {(area: ChartArea, offset: IPoint, size: ISize, settings: IChartingSettings, tcoord: ITimeCoordConverter, vcoord: IValueCoordConverter<number>): FigureComponent}) : FigureComponent;
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

export interface IChartingSettings {
    precision(): number;
}
