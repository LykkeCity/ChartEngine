/**
 * ChartStack class.
 */
import { NumberAxis, PriceAxis } from '../axes/index';
import { ChartPoint, Events, IAxis, IChartPoint, IConfigurable, ICoordsConverter, ISource, ITimeAxis, ITimeCoordConverter, IValueCoordConverter, IVisualComponent, SettingSet, SettingType, VisualComponent, VisualContext }
    from '../core/index';
import { IDataSource } from '../data/index';
import { Area, BoardArea, ChartArea, SizeChangedArgument } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { IRenderLocator } from '../render/index';
import { IPoint, IRange, ISize, Point } from '../shared/index';
import { Chart } from './Chart';
import { Crosshair } from './Crosshair';
import { FigureComponent } from './FigureComponent';
import { Grid } from './Grid';
import { IChart, IChartingSettings, IChartStack, IFigure } from './Interfaces';
import { NumberAxisComponent } from './NumberAxisComponent';
import { PriceAxisComponent } from './PriceAxisComponent';
import { QuicktipBuilder } from './Quicktip';

export class ChartStack extends VisualComponent implements IChartStack, ICoordsConverter, IConfigurable, IChartingSettings {

    private readonly _uid: string;
    private readonly boardArea: BoardArea;
    private readonly area: ChartArea;
    private readonly qtBuilder: QuicktipBuilder;
    private readonly tAxis: ITimeAxis;
    private readonly yAxis: IAxis<number>;
    private readonly _charts: IChart[] = [];
    private readonly crosshair: Crosshair;
    private readonly grid: Grid;
    private readonly _figures: FigureComponent[] = [];
    private readonly yAxisComponent: VisualComponent;
    private _precision: number = 0;
    private source?: ISource;

    constructor(
        uid: string,
        boardArea: BoardArea,
        timeAxis: ITimeAxis,
        yIsPrice: boolean,
        source?: ISource) {
        super();

        this._uid = uid;
        this.boardArea = boardArea;
        this.tAxis = timeAxis;
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

        this.applySettings();
    }

    public get uid(): string {
        return this._uid;
    }

    private getAxisSize(size: ISize) {
        return { width: size.width , height: size.height > 20 ? size.height - 20 : size.height };
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

    public get figures(): IFigure[] {
        return this._figures.slice();
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

    public addFigure(ctor: {
            (area: ChartArea, offset: IPoint, size: ISize, settings: IChartingSettings, tcoord: ITimeCoordConverter, vcoord: IValueCoordConverter<number>, source?: ISource): FigureComponent}) : FigureComponent {
        const figure = ctor(this.area, { x: 0, y: 0 }, this.size, this, this.tAxis, this.yAxis, this.source);
        this._figures.push(figure);
        this.addChild(figure); // to the end
        Events.instance.objectTreeChanged.trigger();
        return figure;
    }

    public removeFigures() {
        this._children = this._children.filter((value, index, array) => {
             return !(value instanceof FigureComponent);
        });
    }

    public precision(): number {
        return this._precision;
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
                    const valuesRange = chart.getValuesRange(this.tAxis.range); //this.tAxis.range, this.tAxis.interval);

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
        this._size = { width: w, height: h};

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

class ChartStackSettings {
    public showGrid = true;
}
