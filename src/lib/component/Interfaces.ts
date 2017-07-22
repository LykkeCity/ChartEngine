/**
 * 
 */
import { ChartPoint, IAxis, ICoordsConverter, IMouse, ISource, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, VisualComponent, VisualContext }
    from '../core/index';
import { Area, ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IChartRender, IRenderLocator, RenderLocator } from '../render/index';
import { IHashTable, IPoint, IRange, ISize } from '../shared/index';
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
    isHit(p: IPoint): boolean;
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
    moveX(shift: number): void;
    setCursor(style: string): void;
}

export interface IChartStack extends ICoordsConverter {
    uid: string;
    offset: IPoint;
    charts: IChart[];
    figures: IFigure[];
    addFigure(figureType: string) : FigureComponent;
}

export interface IChart {
    uid: string;
    name: string;
    precision: number;
    getValuesRange(range: IRange<Uid>): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export interface IFigure {
    uid: string;
    name: string;
}

export interface IStateController {
    activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, parameters?: IHashTable<any>): void;
    deactivate(board: IChartBoard, mouse: IMouse): void;

    onMouseWheel(board: IChartBoard, mouse: IMouse): void;
    onMouseMove(board: IChartBoard, mouse: IMouse): void;
    onMouseEnter(board: IChartBoard, mouse: IMouse): void;
    onMouseLeave(board: IChartBoard, mouse: IMouse): void;
    onMouseUp(board: IChartBoard, mouse: IMouse): void;
    onMouseDown(board: IChartBoard, mouse: IMouse, stack?: IChartStack): void;
}

export function isStateController(obj: any): obj is IStateController {
    return (<IStateController>obj).activate !== undefined
        && (<IStateController>obj).deactivate !== undefined;
}

export interface IChartingSettings {
    precision(): number;
}
