/**
 * ICanvas interface.
 */
import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';
export interface ICanvas {
    readonly w: number;
    readonly h: number;
    clear(): void;
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
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
