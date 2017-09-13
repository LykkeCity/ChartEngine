/**
 * 
 */
import { ChartPoint, Command, EventArgument, IAxis, ICommand, ICoordsConverter, IMouse, ISource, IStateful, ITimeAxis, ITimeCoordConverter, ITouch, IValueCoordConverter, VisualComponent, VisualContext }
    from '../core/index';
import { Area, ChartArea } from '../layout/index';
import { Uid } from '../model/index';
import { IChartRender, IRenderLocator, RenderLocator } from '../render/index';
import { Event, IEvent, IHashTable, IPoint, IRange, ISize } from '../shared/index';
import { FigureComponent } from './FigureComponent';

export interface IDrawing {
    start(figureId: string): void;
    cancel(): void;
}

export interface IHistory {
    length: number;
    undo(): void;
    historyChanged: IEvent<EventArgument>;
}

export interface ISelectable {
    setSelected(selected: boolean): void;
    getSelected(): boolean;
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

    // internal methods
    select(component: VisualComponent|undefined): void;
    push2history(cmd: ICommand): void;
    // accessible for board states
    treeChangedEvt: Event<EventArgument>;
}

export interface IChartStack extends ICoordsConverter, IStateful {
    uid: string;
    offset: IPoint;
    charts: IChart[];
    figures: FigureComponent[];
    addFigure(figureType: string) : FigureComponent;
}

export interface IChart {
    uid: string;
    name: string;
    precision: number;
    getValuesRange(range: IRange<Uid>): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
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

    onTouchPan(board: IChartBoard, touch: ITouch): void;
    onTouchPress(board: IChartBoard, touch: ITouch): void;
    onTouchSwipe(board: IChartBoard, touch: ITouch): void;
    onTouchTap(board: IChartBoard, touch: ITouch, stack?: IChartStack): void;
}

export function isStateController(obj: any): obj is IStateController {
    return (<IStateController>obj).activate !== undefined
        && (<IStateController>obj).deactivate !== undefined;
}

export interface IChartingSettings {
    readonly precision: number;
}
