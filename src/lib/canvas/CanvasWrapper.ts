/**
 * CanvasWrapper class.
 * 
 * @classdesc Incapsulates usage of canvas.
 */

import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';
import { ICanvas } from './ICanvas';

export class CanvasWrapper implements ICanvas {

    private ctx: CanvasRenderingContext2D;
    private adj: number = 0.5; // Adjusment to remove blury lines.

    readonly w: number;
    readonly h: number;
    readonly dpr: number;

    public get font(): string {
        return this.ctx.font;
    }

    public set font(font: string) {
        this.ctx.font = font;
    }

    public get lineWidth(): number {
        return this.ctx.lineWidth;
    }

    public set lineWidth(w: number) {
        this.adj = (w % 2) / 2;         // If line is width 1, 3, 5... then adjust coords to remove blur.
        this.ctx.lineWidth = w;
    }

    constructor(context: CanvasRenderingContext2D, width: number, height: number) {

        this.ctx = context;
        this.w = width;
        this.h = height;
        //this.dpr = window.devicePixelRatio || 1;
        this.dpr = 1;
    }

    public clear() {
        this.ctx.clearRect(0, 0, Math.round(this.w), Math.round(this.h));
    }

    public moveTo(x: number, y: number) {
        this.ctx.moveTo(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj);
    }

    public lineTo(x: number, y: number) {
        this.ctx.lineTo(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj);
    }

    public getLineDash(): number[] {
        return this.ctx.getLineDash();
    }

    public setLineDash(segments: number[]): void {
        this.ctx.setLineDash(segments);
    }

    public fillText(s: string, x: number, y: number) {
        this.ctx.fillText(s, Math.round(x * this.dpr), Math.round(y * this.dpr));
    }

    public fillRect(x: number, y: number, w: number, h: number) {
        this.ctx.fillRect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj,
                          Math.round(w * this.dpr), Math.round(h * this.dpr));
    }

    public strokeRect(x: number, y: number, w: number, h: number) {
        this.ctx.strokeRect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj,
                            Math.round(w * this.dpr), Math.round(h * this.dpr));
    }

    // Used with beginPath() / stroke() / strokeStyle / fill()
    public rect(x: number, y: number, w: number, h: number) {
        this.ctx.rect(Math.round(x * this.dpr) + this.adj, Math.round(y * this.dpr) + this.adj,
                      Math.round(w * this.dpr), Math.round(h * this.dpr));
    }

    public beginPath() {
        this.ctx.beginPath();
    }

    public stroke() {
        this.ctx.stroke();
    }

    public closePath() {
        this.ctx.closePath();
    }

    public setStrokeStyle(style: any) {
        this.ctx.strokeStyle = style;
    }

    public setFillStyle(style: any) {
        this.ctx.fillStyle = style;
    }

    public setTextAlign(v: CanvasTextAlign) {
        this.ctx.textAlign = CanvasTextBaseLine[v].toLowerCase();
    }

    public setTextBaseLine(v: CanvasTextBaseLine) {
        this.ctx.textBaseline = CanvasTextBaseLine[v].toLowerCase();
    }

    public measureText(text: string): TextMetrics {
        return this.ctx.measureText(text);
    }

    public strokeText(text: string, x: number, y: number, maxWidth?: number): void {
        this.ctx.strokeText(text, Math.round(x), Math.round(y), maxWidth);
    }

    private round(n: number): number {
        // With a bitwise or.
        return (0.5 + n) | 0;
        // // A double bitwise not.
        // rounded = ~~ (0.5 + n);
        // // Finally, a left bitwise shift.
        // rounded = (0.5 + n) << 0;
    }
}
