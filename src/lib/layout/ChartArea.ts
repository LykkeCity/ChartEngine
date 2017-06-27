/**
 * ChartArea class.
 */
import { IPoint } from '../core/index';
import { ISize } from '../shared/index';
import { Area } from './Area';

export class YArea extends Area {
    protected readonly cell: HTMLTableCellElement;

    constructor(
        cell: HTMLTableCellElement,
        offset: IPoint,
        size: ISize
        ) {
        super(offset, size);
        this.cell = cell;

        cell.style.setProperty('padding', '0');

        const div = document.createElement('div');
        cell.appendChild(div);

        div.style.setProperty('position', 'relative');
        div.style.setProperty('width', this.size.width + 'px');
        div.style.setProperty('height', this._size.height + 'px');

        this.appendCanvases(div, this._size.width, this._size.height);
    }

    public resize(w: number, h: number) {
        const div = this.cell.getElementsByTagName('div')[0];
        div.style.setProperty('width', w + 'px');
        div.style.setProperty('height', h + 'px');

        super.resize(w, h);
    }
}

export class XArea extends Area {

    private row: HTMLTableRowElement;
    private xAxisHeight: number;

    constructor(
        row: HTMLTableRowElement,
        offset: IPoint,
        size: ISize,
        xAxisHeight: number
        ) {
        super(offset, size);

        this.row = row;
        this.xAxisHeight = xAxisHeight;

        const cell = row.insertCell(0);
        cell.style.setProperty('padding', '0');

        const div = document.createElement('div');
        cell.appendChild(div);

        div.style.setProperty('position', 'relative');
        div.style.setProperty('width', this._size.width + 'px');
        div.style.setProperty('height', this._size.height + 'px');

        this.appendCanvases(div, this._size.width, this._size.height);
    }

    public resize(w: number, h: number) {
        // resize HTML element
        const cellsCount = this.row.cells.length;
        const div = this.row.cells[cellsCount - 1].getElementsByTagName('div')[0];
        div.style.setProperty('width', w + 'px');
        div.style.setProperty('height', h + 'px');

        super.resize(w, h);
    }
}

export class ChartArea extends Area {

    private row: HTMLTableRowElement;
    private yArea: YArea;
    private yAxisWidth: number;
    private qtContater: HTMLElement;

    constructor(
        row: HTMLTableRowElement,
        offset: IPoint,
        size: ISize,
        yAxisWidth: number
        ) {
        super(offset, size);

        this.row = row;
        this.yAxisWidth = yAxisWidth;

        const cell = row.insertCell(0);
        cell.style.setProperty('padding', '0');
        cell.style.setProperty('position', 'relative');

        const div = document.createElement('div');
        cell.appendChild(div);

        div.style.setProperty('position', 'relative');
        div.style.setProperty('height', this._size.height + 'px');
        div.style.setProperty('width', this._size.width + 'px');

        this.appendCanvases(div, this._size.width, this._size.height);

        // Create container for quicktips
        this.qtContater = document.createElement('div');
        this.qtContater.style.setProperty('position', 'absolute');
        this.qtContater.style.setProperty('top', '5px');
        this.qtContater.style.setProperty('left', '5px');
        cell.appendChild(this.qtContater);
    }

    public get qtipContainer(): HTMLElement {
        return this.qtContater;
    }

    public addYAxis() : YArea {

        if (this.yArea) {
            throw new Error('YArea is already defined.');
        }

        const cell = this.row.insertCell(-1);

        this.yArea = new YArea(cell,
                               { x: 0, y: 0},
                               { width: this.yAxisWidth, height: this.size.height });

        return this.yArea;
    }

    public clearBase() {
        if (this.yArea) {
            this.yArea.clearBase();
        }
        super.clearBase();
    }

    public clearFront() {
        if (this.yArea) {
            this.yArea.clearFront();
        }
        super.clearFront();
    }

    public render() {
        super.render();
        this.yArea.render();
    }

    public resize(w: number, h: number): void {

        // resize HTML elements
        // for (let j = 0; j < 3; j += 1) {
        //     const div = this.table.rows.item(i).cells[j].getElementsByTagName('div')[0];
        //     div.style.setProperty('height', (i === 0 ? dh * 2 : dh) + 'px');
        //     if (j === 1) { div.style.setProperty('width', dw + 'px'); }
        // }

        const div = this.row.cells[0].getElementsByTagName('div')[0];
        div.style.setProperty('width', w + 'px');
        div.style.setProperty('height', h + 'px');

        if (this.yArea) {
            this.yArea.resize(this.yAxisWidth, h);
        }

        super.resize(w, h);
    }
}
