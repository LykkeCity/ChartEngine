/**
 * ChartStack class.
 */
import { NumberAxis, PriceAxis } from '../axes/index';
import { ChartPoint, IAxis, IPoint, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { Area, BoardArea, ChartArea, SizeChangedArgument } from '../layout/index';
import { IRenderLocator } from '../render/index';
import { ISize, Point } from '../shared/index';
import { Chart, IChart } from './Chart';
import { Crosshair } from './Crosshair';
import { FigureComponent } from './FigureComponent';
import { Grid } from './Grid';
import { IChartStack } from './Interfaces';
import { NumberAxisComponent } from './NumberAxisComponent';
import { PriceAxisComponent } from './PriceAxisComponent';

export class ChartStack extends VisualComponent implements IChartStack {

    private readonly area: ChartArea;
    private readonly tAxis: IAxis<Date>;
    private readonly yAxis: IAxis<number>;
    private readonly charts: IChart[] = [];
    private readonly crosshair: Crosshair;
    private readonly figures: FigureComponent[] = [];

    constructor(
        boardArea: BoardArea,
        timeAxis: IAxis<Date>,
        yIsPrice: boolean) {
        super();

        this.tAxis = timeAxis;
        this.area = boardArea.addChart();
        this.area.sizeChanged.on(this.onresize);

        this._offset = this.area.offset;
        this._size = this.area.size;

        // create Y axis
        let yAxisComponent: VisualComponent;

        if (yIsPrice) {
            this.yAxis = new PriceAxis(this._size.height, 0.0005);
            yAxisComponent = new PriceAxisComponent(this.area, <PriceAxis>this.yAxis, { x: 0, y: 0 }, this._size);
        } else {
            this.yAxis = new NumberAxis(this._size.height, 0.0005);
            yAxisComponent = new NumberAxisComponent(this.area, <NumberAxis>this.yAxis, { x: 0, y: 0 }, this._size);
        }

        this.addChild(yAxisComponent);

        // create crosshair
        // TODO: this._size = chart size + YAxis.size
        this.crosshair = new Crosshair(this.area, {x: 0, y: 0}, this._size);
        this.addChild(this.crosshair);

        // add grid
        // TODO: this._size = chart size + YAxis.size
        const grid = new Grid(this.area, {x: 0, y: 0}, this._size, timeAxis, this.yAxis);
        this.addChild(grid);
    }

    public addChart<T>(uid: string, chartType: string, dataSource: IDataSource<T>): void {
        const newChart = new Chart<T>(uid, chartType,
                                      this.area,
                                      new Point(0, 0),
                                      this.size,
                                      dataSource, this.tAxis, this.yAxis);
        this.charts.push(newChart);
        this.addChild(newChart);
    }

    public removeChart(uid: string) {
        for (let i = 0; i < this.charts.length; i += 1) {
            if (this.charts[i].uid === uid) {
                this.removeChild(<any>this.charts[i]);
                this.charts.splice(i, 1);
            }
        }
    }

    public addFigure(ctor: {(area: Area, offset: IPoint, size: ISize, timeAxis: IAxis<Date>, yAxis: IAxis<number>): FigureComponent}) : FigureComponent {
        const figure = ctor(this.area, { x: 0, y: 0 }, this.size, this.tAxis, this.yAxis);
        this.figures.push(figure);
        this.addChild(figure);
        return figure;
    }

    // TODO: Rename
    public mouseToCoords(localX: number, localY: number): ChartPoint {
        return new ChartPoint(
            this.tAxis.toValue(localX),
            this.yAxis.toValue(localY)
        );
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase)  {
            // 1. Update y axis before rendering charts
            //
            // TODO: Make DataSource.DefaultYRange or take last known data:
            const yRange = { start: Number.MAX_VALUE, end: Number.MIN_VALUE };
            for (const chart of this.charts) {
                const valuesRange = chart.getValuesRange(this.tAxis.range, this.tAxis.interval);

                if (valuesRange.end > yRange.end) {
                    yRange.end = valuesRange.end;
                }
                if (valuesRange.start < yRange.start) {
                    yRange.start = valuesRange.start;
                }
            }

            if (this.charts.length > 0) {
                this.yAxis.range = yRange;
            } else {
                this.yAxis.range = { start: 0, end: 100 }; // default values
            }
        }

        super.render(context, renderLocator);
    }

    protected onresize = (arg: SizeChangedArgument) => {
        this._offset = this.area.offset;

        const w = this.area.size.width;
        const h = this.area.size.height;

        (<any>this.yAxis).length = arg.size.height;

        // resize self and all children
        super.resize(w, h);
    }
}
