/**
 * ChartStack class.
 */
import { NumberAxis, PriceAxis } from '../axes/index';
import { ChartPoint, Events, IAxis, IChartPoint, IConfigurable, ICoordsConverter, ISource, IStateful, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, SettingSet, SettingType, StoreArray, StoreContainer, VisualComponent, VisualContext }
    from '../core/index';
import { IDataSource } from '../data/index';
import { Area, BoardArea, ChartArea, SizeChangedArgument } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IPoint, IRange, ISize, Point } from '../shared/index';
import { ArrayUtils } from '../utils/index';
import { Chart } from './Chart';
import { Crosshair } from './Crosshair';
import { FigureComponent } from './FigureComponent';
import { FigureFactory } from './FigureFactory';
import { Grid } from './Grid';
import { IChart, IChartingSettings, IChartStack } from './Interfaces';
import { NumberAxisComponent } from './NumberAxisComponent';
import { PriceAxisComponent } from './PriceAxisComponent';
import { QuicktipBuilder } from './Quicktip';

export class ChartStack extends VisualComponent implements IChartStack, ICoordsConverter, IConfigurable, IChartingSettings {

    private readonly boardArea: BoardArea;
    private readonly area: ChartArea;
    private readonly qtBuilder: QuicktipBuilder;
    private readonly tAxis: ITimeAxis;
    private readonly yAxis: IAxis<number>;
    private readonly _charts: IChart[] = [];
    private readonly crosshair: Crosshair;
    private readonly grid: Grid;
    private readonly yAxisComponent: VisualComponent;
    private _precision: number = 0;
    private source?: ISource;
    private events: Events;
    private store: StoreContainer;
    private figureContainer: FigureContainer;

    public get precision(): number {
        return this._precision;
    }

    constructor(
        uid: string,
        boardArea: BoardArea,
        timeAxis: ITimeAxis,
        yIsPrice: boolean,
        events: Events,
        store: StoreContainer,
        source?: ISource) {
        super(undefined, undefined, uid);

        this.boardArea = boardArea;
        this.tAxis = timeAxis;
        this.events = events;
        this.store = store;
        this.source = source;
        this.area = boardArea.addChart();
        this.area.sizeChanged.on(this.onresize);

        this._offset = new Point(this.area.offset.x, this.area.offset.y);
        this._size = this.area.size;

        this.qtBuilder = new QuicktipBuilder(this.area.qtipContainer);

        // create Y axis
        //
        const p = { x: 0, y: 0 };
        const size = this.getAxisSize(this._size);

        if (yIsPrice) {
            this.yAxis = new PriceAxis(size.height, 0.0001);
            this.yAxisComponent = new PriceAxisComponent(this.area, <PriceAxis>this.yAxis, p, size, this);
        } else {
            this.yAxis = new NumberAxis(size.height, 0.0001);
            this.yAxisComponent = new NumberAxisComponent(this.area, <NumberAxis>this.yAxis, p, size, this);
        }

        this.addChild(this.yAxisComponent);

        // create crosshair
        // TODO: this._size = chart size + YAxis.size
        this.crosshair = new Crosshair(this.area, {x: 0, y: 0}, this._size, this.tAxis);
        this.addChild(this.crosshair);

        // add grid
        // TODO: this._size = chart size + YAxis.size
        this.grid = new Grid(this.area, {x: 0, y: 0}, this._size, this.tAxis, this.yAxis);
        this.addChild(this.grid);

        this.figureContainer = new FigureContainer(this._offset, this._size, this.area, this.tAxis, this.yAxis,
                                                   this, this.store.getArrayProperty('figures'), this.source);
        this.addChild(this.figureContainer);

        this.applySettings();
    }

    private getAxisSize(size: ISize) {
        return { width: size.width, height: size.height > 20 ? size.height - 20 : size.height };
    }

    /**
     * Removes chart area
     */
    public dispose() {
        this.area.sizeChanged.off(this.onresize);
        this.boardArea.remove(this.area);
    }

    /**
     * Returns contained charts' identifiers.
     */
    public get chartIds(): string[] {
        return this._charts.map(c => c.uid);
    }

    public get charts(): IChart[] {
        return this._charts.slice();
    }

    public get figures(): FigureComponent[] {
        return this.figureContainer.children
            .filter(el => { return (el instanceof FigureComponent); })
            .map(vc => <FigureComponent>vc);
    }

    public contains(uid: string): boolean {
        return this.figureContainer.contains(uid);
    }

    public addChart<T>(uid: string, name: string, chartType: string, dataSource: IDataSource<Candlestick>): void {
        const qtip = this.qtBuilder.addQuicktip(uid);

        const newChart = new Chart(uid,
                                   name,
                                   chartType,
                                   this.area,
                                   this.tAxis,
                                   new Point(0, 0),
                                   this.size,
                                   dataSource, this.yAxis,
                                   qtip);
        this._charts.push(newChart);
        this.addChild(newChart);

        this.updateChartingSettings();
    }

    public removeChart(uid: string) {
        for (let i = 0; i < this._charts.length; i += 1) {
            if (this._charts[i].uid === uid) {
                this.removeChild(<any>this._charts[i]);
                this._charts.splice(i, 1);
            }
        }
        this.qtBuilder.removeQuicktip(uid);

        this.updateChartingSettings();
    }

    public addFigure(figureType: string): FigureComponent {
        return this.figureContainer.addFigure(figureType);
    }

    public removeFigure(uid: string): void {
        this.figureContainer.removeFigure(uid);
    }

    public moveUp(uid: string) {
        this.figureContainer.moveUp(uid);
    }

    public moveDown(uid: string) {
        this.figureContainer.moveDown(uid);
    }

    public moveTop(uid: string) {
        this.figureContainer.moveTop(uid);
    }

    public moveBottom(uid: string) {
        this.figureContainer.moveBottom(uid);
    }

    public getState(): string {
        return this.store.serialize();
    }

    public restore(state: string) {
        this.store.deserialize(state);
        this.figureContainer.setStore(this.store.getArrayProperty('figures'));
    }

    public setStore(store: StoreContainer) {
        this.store = store;
        this.figureContainer.setStore(store.getArrayProperty('figures'));
    }

    // TODO: Rename
    public mouseToCoords(localX: number, localY: number): ChartPoint {
        throw new Error('Not implemented');
    }

    public toX(value: Uid): number|undefined {
        return this.tAxis.toX(value);
    }

    public xToValue(x: number): Uid|undefined {
        return this.tAxis.toValue(x);
    }

    public toY(value: number): number {
        return this.yAxis.toX(value);
    }

    public yToValue(y: number): number | undefined {
        return this.yAxis.toValue(y);
    }

    public toXY(point: IChartPoint): IPoint|undefined {
        if (point.uid && point.v !== undefined) {
            const x = this.toX(point.uid);
            const y = this.toY(point.v);
            return x !== undefined ? { x: x, y: y } : undefined;
        }
    }

    public xyToValue(point: IPoint): IChartPoint {
        return {
            uid: this.xToValue(point.x),
            v: this.yToValue(point.y)
        };
    }

    private _fixedRange: IRange<number> | undefined;
    public setFixedRange(range: IRange<number>) {
        this._fixedRange = range;
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase)  {
            // 1. Update y axis before rendering charts

            if (this._fixedRange) {
                this.yAxis.range = this._fixedRange;
            } else {
                //
                // TODO: Make DataSource.DefaultYRange or take last known data:
                const yRange = { start: Number.MAX_VALUE, end: Number.MIN_VALUE };
                for (const chart of this._charts) {
                    const valuesRange = chart.getValuesRange(this.tAxis.range);

                    if (valuesRange.end > yRange.end) {
                        yRange.end = valuesRange.end;
                    }
                    if (valuesRange.start < yRange.start) {
                        yRange.start = valuesRange.start;
                    }
                }

                if (this._charts.length > 0) {
                    this.yAxis.range = yRange;
                } else {
                    this.yAxis.range = { start: 0, end: 100 }; // default values
                }
            }
        }

        super.render(context, renderLocator);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        [this._offset.x, this._offset.y] = [this.area.offset.x, this.area.offset.y];

        const w = this.area.size.width;
        const h = this.area.size.height;

        // Instead of default resize using custom resizing
        this._size = { width: w, height: h };

        const axisSize = this.getAxisSize(this._size);
        (<any>this.yAxis).length = axisSize.height;
        this.yAxisComponent.resize(axisSize.width, axisSize.height);

        for (const vc of this._children) {
            vc.resize(w, h);
        }
        this.crosshair.resize(w, h);
        this.grid.resize(w, h);

        // resize self and all children
        //super.resize(w, h);
    }

    private settings: ChartStackSettings = new ChartStackSettings();

    public getSettings(): SettingSet {
        const settings = new SettingSet({ name: 'stacksettings', group: true });

        settings.setSetting('showGrid', new SettingSet({
            name: 'showGrid',
            displayName: 'Show grid',
            settingType: SettingType.check,
            value: this.settings.showGrid.toString()
        }));
        return settings;
    }

    public setSettings(value: SettingSet): void {
        const showGrid = value.getSetting('stacksettings.showGrid');
        if (showGrid) {
            this.settings.showGrid = (showGrid.value === 'true');
        }

        this.applySettings();
    }

    private applySettings() {
        this.grid.visible = this.settings.showGrid;
    }

    private updateChartingSettings() {

        // select maximum precision among data sources
        this._precision = 0;
        for (const chart of this._charts) {
            this._precision = Math.max(this._precision, chart.precision);
        }
    }
}

/**
 * Auxillary class for storing and managing figures inside chart stack.
 */
class FigureContainer extends VisualComponent {
    constructor(
        offset: IPoint, size: ISize,
        private area: ChartArea,
        private tAxis: ITimeAxis,
        private yAxis: IAxis<number>,
        private chartSettings: IChartingSettings,
        private store: StoreArray,
        private source?: ISource
    ) {
        super(offset, size);
    }

    public contains(uid: string): boolean {
        return this._children.some(vc => {
            return (vc instanceof FigureComponent && vc.uid === uid);
        });
    }

    public addFigure(figureType: string): FigureComponent {

        const figures = this.store;
        const figureDesc = figures.addItem();
        const figureContainer = figureDesc.getObjectProperty('figure');

        const figure = this.createFigure(figureType, figureContainer);
        figureDesc.setProperty('type', figureType);

        return figure;
    }

    public removeFigure(uid: string): boolean {
        // Remove from storage
        //
        const figures = this.store;
        figures.remove(sc => {
            return uid === sc.getProperty('figure.uid');
        });

        // Remove form list and trigger change event
        //
        let index = -1;
        this._children.forEach((vc: VisualComponent, i: number) => {
            if (vc instanceof FigureComponent && vc.uid === uid) {
                index = i;
            }
        });

        if (index !== -1) {
            this._children.splice(index, 1);
            return true;
        } else {
            return false;
        }
    }

    public moveUp(uid: string) {
        const i = this.store.indexOf(el => { return uid === el.getProperty('figure.uid'); });
        if (i !== -1) {
            this.store.shift(i, 1);
            ArrayUtils.SHIFT(this._children, i, 1);
        }
    }

    public moveDown(uid: string) {
        const i = this.store.indexOf(el => { return uid === el.getProperty('figure.uid'); });
        if (i !== -1) {
            this.store.shift(i, -1);
            ArrayUtils.SHIFT(this._children, i, -1);
        }
    }

    public moveTop(uid: string) {
        const i = this.store.indexOf(el => { return uid === el.getProperty('figure.uid'); });
        if (i !== -1) {
            this.store.shift(i, Infinity);
            ArrayUtils.SHIFT(this._children, i, Infinity);
        }
    }

    public moveBottom(uid: string) {
        const i = this.store.indexOf(el => { return uid === el.getProperty('figure.uid'); });
        if (i !== -1) {
            this.store.shift(i, -Infinity);
            ArrayUtils.SHIFT(this._children, i, -Infinity);
        }
    }

    private createFigure(figureType: string, container: StoreContainer): FigureComponent {
        const figure = FigureFactory.instance
            .instantiate(figureType, this.area, { x: 0, y: 0 }, this.size, this.chartSettings, this.tAxis, this.yAxis, container, this.source);
        this.addChild(figure); // to the end
        return figure;
    }

    public setStore(store: StoreArray) {
        this.store = store;
        this.reloadFigures();
    }

    private reloadFigures() {
        // remove figures
        this._children = this._children.filter((value, index, array) => {
            return !(value instanceof FigureComponent);
        });

        const figures = this.store;
        for (const figureDesc of figures.asArray()) {
            // add figure
            const figureType = figureDesc.getProperty('type');
            const figureContainer = figureDesc.getObjectProperty('figure');

            this.createFigure(figureType, figureContainer);
        }
    }
}

class ChartStackSettings {
    public showGrid = true;
}
