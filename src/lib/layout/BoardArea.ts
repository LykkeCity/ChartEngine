/**
 * BoardArea class
 */
import { ISize } from '../shared/index';
import { ChartArea, XArea } from './ChartArea';

export class BoardArea {
    private readonly table: HTMLTableElement;

    private readonly yAxisWidth = 90;
    private readonly xAxisHeight = 25;

    private chartWidth: number;
    private chartHeight: number;

    private readonly chartAreas: ChartArea[] = [];
    private timeArea: XArea;

    constructor(
        private readonly container: HTMLElement,
        private readonly size: ISize
    ) {
        this.table = document.createElement('table');
        this.table.style.setProperty('position', 'relative');
        this.table.style.setProperty('border-spacing', '0');
        this.table.style.setProperty('border-collapse', 'collapse');
        this.container.appendChild(this.table);

        this.chartWidth = this.size.width - this.yAxisWidth;
        this.chartHeight = this.size.height - this.xAxisHeight;

        // create x axis area
        const xrow = this.table.insertRow(-1); // to end
        this.timeArea = new XArea(xrow,
                                  { x: 0, y: this.chartHeight },
                                  { width: this.chartWidth, height: this.xAxisHeight },
                                  this.xAxisHeight);
    }

    public addChart() : ChartArea {

        const index = this.chartAreas.length;

        const row = this.table.insertRow(index);

        const area = new ChartArea(row,
                                   { x: 0, y: 0},
                                   { width: this.chartWidth, height: this.chartHeight },
                                   this.yAxisWidth,
                                   this.timeArea);
        this.chartAreas.push(area);
        return area;
    }

    public render() {
        for (const area of this.chartAreas) {
            area.render();
        }
        this.timeArea.render();
    }

    public remove(area: ChartArea) {
        const index = this.chartAreas.indexOf(area);
        if (index !== -1) {
            this.chartAreas.splice(index, 1);
            this.table.deleteRow(index);
        }
    }

    public getXArea(): XArea {
        return this.timeArea;
    }

    public clearBase() {
        for (const area of this.chartAreas) {
            area.clearBase();
        }
        this.timeArea.clearBase();
    }

    public clearFront() {
        for (const area of this.chartAreas) {
            area.clearFront();
        }
        this.timeArea.clearFront();
    }

    public get chartLength() {
        return this.chartWidth;
    }

    public resize(w: number, h: number): void {

        // resize inner components
        const dh = Math.floor((h - this.xAxisHeight) / (this.chartAreas.length + 1));

        this.chartWidth = w - this.yAxisWidth;
        //this.chartHeight = this.size.height - this.xAxisHeight;

        let yOffset = 0;
        let i = 0;
        for (; i < this.chartAreas.length; i += 1) {
            // resize charts
            // update vertical and horizontal offset
            this.chartAreas[i].offset = { x: this.chartAreas[i].offset.x, y: yOffset };
            this.chartAreas[i].resize(this.chartWidth, i === 0 ? dh * 2 : dh);

            yOffset += (i === 0 ? dh * 2 : dh);
        }
        // resize time axis

        this.timeArea.offset = { x: this.timeArea.offset.x, y: yOffset };
        this.timeArea.resize(this.chartWidth, this.xAxisHeight);
    }

    public setCursor(style: string) {
        this.table.setAttribute('cursor', style);
    }
}
