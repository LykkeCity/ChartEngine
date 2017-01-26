/**
 * CanvasWrapper class.
 *
 * @classdesc Incapsulates usage of canvas.
 */
import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';
import { ICanvas } from './ICanvas';
export declare class CanvasWrapper implements ICanvas {
    private ctx;
    private adj;
    readonly w: number;
    readonly h: number;
    readonly dpr: number;
    lineWidth: number;
    constructor(context: CanvasRenderingContext2D, width: number, height: number);
    clear(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    fillText(s: string, x: number, y: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    rect(x: number, y: number, w: number, h: number): void;
    beginPath(): void;
    stroke(): void;
    closePath(): void;
    setStrokeStyle(style: any): void;
    setFillStyle(style: any): void;
    setTextAlign(v: CanvasTextAlign): void;
    setTextBaseLine(v: CanvasTextBaseLine): void;
    measureText(text: string): TextMetrics;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    private round(n);
}
