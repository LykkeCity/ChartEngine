/**
 * Classes for drawing lines.
 */

import { FigureComponent, IChartBoard, IChartingSettings, IChartStack, IEditable, IHoverable, ISelectable, IStateController, NumberRegionMarker, TimeRegionMarker } from '../component/index';
import { ChartPoint, IAxis, IConfigurable, IMouse, ISetting, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, Mouse, SettingSet, SettingType, VisualContext } from '../core/index';
import { ChartArea } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { PointFigureComponent } from './PointFigureComponent';

class LineFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new LineSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private timeRegion: TimeRegionMarker;
    private valueRegion: NumberRegionMarker;

    public get pointA(): ChartPoint {
        return this.pa.point;
    }

    public get pointB(): ChartPoint {
        return this.pb.point;
    }

    constructor(
        private area: ChartArea,
        offset: Point,
        size: ISize,
        settings: IChartingSettings,
        private taxis: ITimeCoordConverter,
        private yaxis: IValueCoordConverter<number>
        ) {
        super(offset, size);

        this.timeRegion = new TimeRegionMarker(this.area.getXArea(), this.offset, this.size, taxis, settings, this.getTimeRange);
        this.addChild(this.timeRegion);

        this.valueRegion = new NumberRegionMarker(this.area.getYArea(), this.offset, this.size, yaxis, settings, this.getValueRange);
        this.addChild(this.valueRegion);

        this.pa = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);
        this.pb = new PointFigureComponent(area, offset, size, settings, taxis, yaxis);

        this.addChild(this.pa);
        this.addChild(this.pb);
    }

    private getTimeRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.uid !== undefined && this.pb.point.uid !== undefined) {
            return { start: this.pa.point.uid, end: this.pb.point.uid };
        }
    }

    private getValueRange = (ctx: VisualContext, size: ISize) => {
        if (this.pa.point.v !== undefined && this.pb.point.v !== undefined) {
            return { start: this.pa.point.v, end: this.pb.point.v };
        }
    }

    public isHit(x: number, y: number): boolean {
        const ca = this.pa.getXY();
        const cb = this.pb.getXY();

        return (ca && cb)
            ? DrawUtils.IS_POINT_ON_LINE({ x: x, y: y }, ca, cb, 5)
            : false;
    }

    public setSelected(selected: boolean): void {
        super.setSelected(selected);
        this.valueRegion.visible = selected;
        this.timeRegion.visible = selected;
    }

    public shift(dx: number, dy: number): boolean {
        const a = this.pa.shift(dx, dy);
        const b = this.pb.shift(dx, dy);
        return a || b;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        // only render on front
        if (!context.renderFront) {
            return;
        }

        const ca = this.pa.getXY();
        const cb = this.pb.getXY();

        if (ca && cb) {
            const canvas = this.area.frontCanvas;

            canvas.setStrokeStyle(this.settings.color);
            canvas.lineWidth = this.settings.width;
            canvas.beginPath();
            canvas.moveTo(ca.x, ca.y);
            canvas.lineTo(cb.x, cb.y);
            canvas.stroke();
        }

        super.render(context, renderLocator);
    }

    public getEditState(): IStateController {
        return EditLineState.instance;
    }

    public getSettings(): SettingSet {
        return new SettingSet({
            name: 'line',
            group: true,
            settings: [
                {
                    name: 'color',
                    value: this.settings.color.toString(),
                    settingType: SettingType.color,
                    displayName: 'Color'
                }, {
                    name: 'width',
                    value: this.settings.width.toString(),
                    settingType: SettingType.numeric,
                    displayName: 'Width'
                }
            ]
        });
    }

    public setSettings(value: SettingSet): void {
        this.settings.color = value.getValueOrDefault<string>('line.color', this.settings.color);
        this.settings.width = value.getValueOrDefault<number>('line.width', this.settings.width);

        // rerender
        //this.context.render();
    }
}

export class LineSettings {
    public color = '#FF0000';
    public width = 1;
}

export class DrawLineState implements IStateController {
    private static inst?: DrawLineState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new DrawLineState();
        }
        return this.inst;
    }

    private mouse = new Mouse();
    private chartStack?: IChartStack;
    private line?: LineFigureComponent;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];

        if (this.line && this.chartStack) {
            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            if (coordX && coordY) {
                // this.line.pointB.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
                // this.line.pointB.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
                this.line.pointB.uid = coordX;
                this.line.pointB.v = coordY;
            }
        }
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
        this.line = undefined;
        this.chartStack = undefined;
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;

        [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            this.line = <LineFigureComponent>this.chartStack.addFigure((area, offset, size, settings, tcoord, vcoord) => {
                return new LineFigureComponent(area, offset, size, settings, tcoord, vcoord);
            });

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            this.line.pointA.uid = coordX;
            this.line.pointA.v = coordY;

            this.line.pointB.uid = coordX;
            this.line.pointB.v = coordY;
        }
    }

    public activate(board: IChartBoard, mouse: IMouse): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        board.changeState('hover');
    }
}

class EditLineState implements IStateController {
    private static inst?: EditLineState;
    private constructor() { }

    public static get instance() {
        if (!this.inst) {
            this.inst = new EditLineState();
        }
        return this.inst;
    }

    private mouse = new Mouse();
    private chartStack?: IChartStack;
    private line?: LineFigureComponent;
    private currentCoords?: ChartPoint;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.line && this.chartStack) {
            // Change mouse x/y only if line was shifted. Ignoring "empty" movement.
            const shifted = this.line.shift(mouse.x - this.mouse.x, mouse.y - this.mouse.y);
            if (shifted) {
                [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];
            }
        } else {
            [this.mouse.x, this.mouse.y] = [mouse.x, mouse.y];
            console.debug('Edit state: line or chartStack is not found.');
        }
    }

    public onMouseEnter(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = true;
    }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isEntered = false;
        this.mouse.isDown = false;
    }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = false;
        this.exit(board, mouse);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void {
        this.mouse.isDown = true;
    }

    public activate(board: IChartBoard, mouse: IMouse, activationParameters?: IHashTable<any>): void {
        [this.mouse.x, this.mouse.y, this.mouse.isDown, this.mouse.isEntered] = [mouse.x, mouse.y, mouse.isDown, mouse.isEntered];

        // Determine which ChartStack was hit
        this.chartStack = board.getHitStack(mouse.x - board.offset.x, mouse.y - board.offset.y);
        if (this.chartStack) {
            // this.currentCoords = this.chartStack.mouseToCoords(
            //     mouse.x - board.offset.x - this.chartStack.offset.x,
            //     mouse.y - board.offset.y - this.chartStack.offset.y);
        } else {
            throw new Error('Can not find hit chart stack.');
        }

        if (activationParameters && activationParameters['component']) {
            this.line = <LineFigureComponent>activationParameters['component'];
        } else {
            throw new Error('Editable component is not specified for edit.');
        }
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    private exit(board: IChartBoard, mouse: IMouse): void {
        this.line = undefined;
        this.chartStack = undefined;
        board.changeState('hover');
    }
}
