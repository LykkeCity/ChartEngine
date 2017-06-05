/**
 * ICanvas interface.
 */
import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';

export interface ICanvas {
    readonly w: number;
    readonly h: number;

    font: string;
    fillStyle: string;
    globalAlpha: number;
    lineWidth: number;

    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    beginPath(): void;
    clear(): void;
    closePath(): void;
    drawImage(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, width?: number, height?: number): void;
    fill(fillRule?: string): void;
    fillText(s: string, x: number, y: number): void;
    fillRect(x: number, y: number, w: number, h: number): void;
    getLineDash(): number[];
    lineTo(x: number, y: number): void;
    measureText(text: string): TextMetrics;
    moveTo(x: number, y: number): void;
    setFillStyle(style: any): void;
    setLineDash(segments: number[]): void;
    setStrokeStyle(style: any): void;
    setTextAlign(v: CanvasTextAlign): void;
    setTextBaseLine(v: CanvasTextBaseLine): void;
    stroke(): void;
    strokeRect(x: number, y: number, w: number, h: number): void;
    strokeText(text: string, x: number, y: number, maxWidth?: number): void;
    rect(x: number, y: number, w: number, h: number): void;
}
