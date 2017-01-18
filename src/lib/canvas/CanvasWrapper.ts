/**
 * CanvasWrapper class.
 * 
 * @classdesc Incapsulates usage of canvas.
 */

import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';
import { ICanvas } from './ICanvas';

export class CanvasWrapper implements ICanvas {

    private ctx: CanvasRenderingContext2D;

    readonly w: number;
    readonly h: number;
    readonly dpr: number;

    constructor(context: CanvasRenderingContext2D, width: number, height: number) {

        this.ctx = context;
        this.w = width;
        this.h = height;
        this.dpr = 1;

        //this.ctx.translate(0.5, 0.5);
        //this.ressize(width, height);
    }

    clear() {
        this.ctx.clearRect(0, 0, this.w, this.h);
    }

    moveTo(x: number, y: number) {
        this.ctx.moveTo(x * this.dpr, y * this.dpr);
    }

    lineTo(x: number, y: number) {
        this.ctx.lineTo(x * this.dpr, y * this.dpr);
    }

    fillText(s: string, x: number, y: number) {
        this.ctx.fillText(s, x * this.dpr, y * this.dpr);
    }

    fillRect(x: number, y: number, w: number, h: number) {
        this.ctx.fillRect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    }

    strokeRect(x: number, y: number, w: number, h: number) {
        this.ctx.strokeRect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    }

    // Used with beginPath() / stroke() / strokeStyle / fill()
    rect(x: number, y: number, w: number, h: number) {
        this.ctx.rect(x * this.dpr, y * this.dpr, w * this.dpr, h * this.dpr);
    }

    beginPath() {
        this.ctx.beginPath();
    }

    stroke() {
        this.ctx.stroke();
    }

    closePath() {
        this.ctx.closePath();
    }

    setStrokeStyle(style: any) {
        this.ctx.strokeStyle = style;
    }

    setFillStyle(style: any) {
        this.ctx.fillStyle = style;
    }

    setTextAlign(v: CanvasTextAlign) {
        this.ctx.textAlign = CanvasTextBaseLine[v].toLowerCase();
    }

    setTextBaseLine(v: CanvasTextBaseLine) {
        this.ctx.textBaseline = CanvasTextBaseLine[v].toLowerCase();
    }

    measureText(text: string): TextMetrics {
        return this.ctx.measureText(text);
    }

    strokeText(text: string, x: number, y: number, maxWidth?: number): void {
        this.ctx.strokeText(text, x, y, maxWidth);
    }
}
