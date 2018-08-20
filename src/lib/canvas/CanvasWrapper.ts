/**
 * CanvasWrapper class.
 * 
 * @classdesc Incapsulates usage of canvas.
 */
import { CanvasTextAlign, CanvasTextBaseLine } from './Enums';
import { ICanvas } from './ICanvas';

export class CanvasWrapper implements ICanvas {
    private ctx: CanvasRenderingContext2D;
    public w: number;
    public h: number;
    private readonly ratio: number;
    private adj: number = 0.5; // Adjusment to remove blury lines. Default value for line width = 1.

    public get font(): string {
        return this.ctx.font;
    }

    public set font(font: string) {
        this.ctx.font = font;
    }

    public set fillStyle(fillStyle: string) {
        this.ctx.fillStyle = fillStyle;
    }

    public get globalAlpha(): number {
        return this.ctx.globalAlpha;
    }

    public set globalAlpha(alpha: number) {
        this.ctx.globalAlpha = alpha;
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
        const dpr = window.devicePixelRatio || 1;
        const bsr = (<any>this.ctx).webkitBackingStorePixelRatio ||
              (<any>this.ctx).mozBackingStorePixelRatio ||
              (<any>this.ctx).msBackingStorePixelRatio ||
              (<any>this.ctx).oBackingStorePixelRatio ||
              (<any>this.ctx).backingStorePixelRatio || 1;
        this.ratio = dpr / bsr;

        this.w = width;
        this.h = height;

        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
    }

    public clear() {
        this.ctx.clearRect(0, 0, this.round(this.w), this.round(this.h));
    }

    public getLineDash(): number[] {
        return this.ctx.getLineDash();
    }

    public setLineDash(segments: number[]): void {
        this.ctx.setLineDash(segments);
    }

    public moveTo(x: number, y: number) {
        this.ctx.moveTo(this.round(x) + this.adj, this.round(y) + this.adj);
    }

    public lineTo(x: number, y: number) {
        this.ctx.lineTo(this.round(x) + this.adj, this.round(y) + this.adj);
    }

    public fill(fillRule?: any) {
        this.ctx.fill(fillRule);
    }

    public fillRect(x: number, y: number, w: number, h: number) {
        this.ctx.fillRect(this.round(x), this.round(y), this.round(w), this.round(h));
    }

    public strokeRect(x: number, y: number, w: number, h: number) {
        this.ctx.strokeRect(this.round(x) + this.adj, this.round(y) + this.adj,
                            this.round(w) - this.adj * 2, this.round(h) - this.adj * 2);
    }

    // Used with beginPath() / stroke() / strokeStyle / fill()
    public rect(x: number, y: number, w: number, h: number) {
        this.ctx.rect(this.round(x) + this.adj, this.round(y) + this.adj,
                      this.round(w) - this.adj * 2, this.round(h) - this.adj * 2);
    }

    public arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
        this.ctx.arc(this.round(x), this.round(y), radius, startAngle, endAngle, anticlockwise);
    }

    public ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean) {
        this.ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, anticlockwise);
    }

    public quadraticCurveTo(cpx: number, cpy: number, x: number, y: number) {
        this.ctx.quadraticCurveTo(cpx, cpy, x, y);
    }

    public fillText(s: string, x: number, y: number) {
        this.ctx.fillText(s, this.round(x), this.round(y));
    }

    public drawImage(canvas: HTMLCanvasElement, offsetX: number, offsetY: number, width?: any, height?: any): void {
        this.ctx.drawImage(canvas, offsetX, offsetY, width, height);
    }

    public resize(w: number, h: number): void {
        this.w = w;
        this.h = h;
        // restore transformation
        this.ctx.setTransform(this.ratio, 0, 0, this.ratio, 0, 0);
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
        this.ctx.strokeText(text, this.round(x), this.round(y), maxWidth);
    }

    public save() {
        this.ctx.save();
    }

    public restore() {
        this.ctx.restore();
    }

    public clip(fillRule?: any) {
        this.ctx.clip(fillRule);
    }

    private round(n: number): number {
        return (0.5 + n) | 0;
    }
}
