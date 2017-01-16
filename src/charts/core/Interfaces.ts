import { IRange } from "shared/Interfaces"
import { IEvent } from "shared/Event"
import { CanvasTextAlign, CanvasTextBaseLine, TimeInterval } from "core/Enums"

export interface ILayout {
    readonly dateRange: IRange<Date>;
    readonly interval: TimeInterval;

    setOrdinateRange(range: IRange<number>): void;
    getXbyDate(date: Date): number;
    getYbyPrice(price: number): number;
}

// export interface IScale {
//     move(direction: number): void;
// }

export interface IAxis<T> {
    range: IRange<T>;
    width: number;
    interval: number;
    toX(value: T): number;
    move(direction: number): void;
    scale(direction: number): void;
}

export interface IChartData<T> {
    readonly data: T[];
    readonly maxOrdinateValue: number;
    readonly minOrdinateValue: number;
}

export interface IDataSource<T> {
    getData(range: IRange<Date>): IChartData<T>;
    dateChanged: IEvent<void>;
}

export interface IIndicator {

}

// export interface IRenderer {
//     render(canvas: ICanvas, layout: ILayout): void;
// }

export interface ICanvas {
    readonly w: number;
    readonly h: number;
    clear(): void;
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void
    stroke(): void;
    closePath(): void;
    fillText(s: string, x: number, y: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    setStrokeStyle(style: any): void;
    setFillStyle(style: any): void;
    setTextAlign(v: CanvasTextAlign): void;
    setTextBaseLine(v: CanvasTextBaseLine): void;
    measureText(text: string): TextMetrics;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
}

export interface IMouseHandler {
    onMouseWheel(direction: number): void;
    onMouseMove(event: any): void;
    onMouseEnter(event: any): void;
    onMouseLeave(event: any): void;
    onMouseUp(event: any): void;
    onMouseDown(event: any): void;
    onclick(event: any): void;
}