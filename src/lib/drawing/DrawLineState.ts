/**
 * Classes for drawing lines.
 */

import { FigureComponent, IChartBoard, IChartStack, IEditable, IHoverable, ISelectable, IStateController } from '../component/index';
import { ChartPoint, IAxis, IConfigurable, ICoordsConverter, IMouse, ISetting, Mouse, SettingSet, SettingType, VisualContext } from '../core/index';
import { Area } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { IHashTable, ISize, Point } from '../shared/index';
import { DrawUtils } from '../utils/index';
import { PointFigureComponent } from './PointFigureComponent';

class LineFigureComponent extends FigureComponent implements IHoverable, IEditable, IConfigurable, ISelectable {
    private settings = new LineSettings();
    private pa: PointFigureComponent;
    private pb: PointFigureComponent;
    private isHovered = false;
    private isSelected = false;

    public get pointA(): ChartPoint {
        return this.pa.point;
    }

    public get pointB(): ChartPoint {
        return this.pb.point;
    }

    constructor(
        private area: Area,
        offset: Point,
        size: ISize,
        private coords: ICoordsConverter
        ) {
        super(offset, size);

        this.pa = new PointFigureComponent(area, offset, size, coords);
        this.pb = new PointFigureComponent(area, offset, size, coords);

        this.addChild(this.pa);
        this.addChild(this.pb);
    }

    public isHit(x: number, y: number): boolean {
        const ca = this.pa.getXY();
        const cb = this.pb.getXY();

        return (ca && cb)
            ? DrawUtils.IS_POINT_ON_LINE({ x: x, y: y }, ca, cb, 5)
            : false;
    }

    public setHovered(hovered: boolean): void {
        this.isHovered = hovered;
        this.pa.setHovered(hovered);
        this.pb.setHovered(hovered);
    }

    public setSelected(selected: boolean): void {
        this.isSelected = selected;
        this.pa.setSelected(selected);
        this.pb.setSelected(selected);
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
            this.line = <LineFigureComponent>this.chartStack.addFigure((area, offset, size, coords) => {
                //throw new Error('Not implemented');
                return new LineFigureComponent(area, offset, size, coords);
            });

            // const timeNumberCoords = this.chartStack.mouseToCoords(
            //     mouse.x - board.offset.x - this.chartStack.offset.x,
            //     mouse.y - board.offset.y - this.chartStack.offset.y
            // );

            const coordX = this.chartStack.xToValue(mouse.x - board.offset.x - this.chartStack.offset.x);
            const coordY = this.chartStack.yToValue(mouse.y - board.offset.y - this.chartStack.offset.y);

            // this.line.pointA.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
            // this.line.pointA.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
            this.line.pointA.uid = coordX;
            this.line.pointA.v = coordY;

            // this.line.pointB.t = (typeof coordX === 'string') ? undefined : <Date>coordX;
            // this.line.pointB.uid = (typeof coordX === 'string') ? <string>coordX : undefined;
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
