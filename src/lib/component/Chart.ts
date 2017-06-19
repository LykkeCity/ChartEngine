/**
 * Chart class.
 */
import { IAxis, IConfigurable, IQuicktip, ITimeAxis, SettingSet, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { ChartArea } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { IChartRender, IRenderLocator, RenderLocator } from '../render/index';
import { IRange, ISize, Point } from '../shared/index';
import { ChartPopup } from './ChartPopup';
import { IHoverable } from './Interfaces';

export interface IChart {
    uid: string;
    name: string;
    precision: number;
    getValuesRange(range: IRange<Uid>): IRange<number>;
    render(context: VisualContext, renderLocator: IRenderLocator): void;
}

export class Chart extends VisualComponent implements IChart, IHoverable, IConfigurable {
    private readonly _uid: string;
    private readonly _name: string;
    private readonly area: ChartArea;
    private readonly tAxis: ITimeAxis;
    //private readonly popup: ChartPopup<Candlestick>;
    private readonly renderer: IChartRender<Candlestick>;

    constructor(
        uid: string,
        name: string,
        private readonly chartType: string,
        chartArea: ChartArea,
        tAxis: ITimeAxis,
        offset: Point,
        size: ISize,
        private readonly dataSource: IDataSource<Candlestick>,
        private readonly yAxis: IAxis<number>,
        private readonly qtip: IQuicktip) {
            super(offset, size);

            this._uid = uid;
            this._name = name;
            this.area = chartArea;
            this.tAxis = tAxis;
            // this.popup = new ChartPopup<T>(chartType, this.area, { x: 0, y: 0 }, size, dataSource, timeAxis, yAxis);
            // this.addChild(this.popup);

            //this.qtip.addTextBlock('title', 'CHART ' + uid);

            this.renderer = <IChartRender<Candlestick>>RenderLocator.Instance.getChartRender(Candlestick, this.chartType);
    }

    public get uid(): string {
        return this._uid;
    }

    public get name(): string {
        return this._name;
    }

    public get precision(): number {
        return this.dataSource.precision;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return this.dataSource.getValuesRange(range);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        const iterator = this.dataSource.getIterator();

        this.qtip.removeTextBlock('name');
        this.qtip.removeTextBlock('value');
        this.qtip.addTextBlock('name', this.dataSource.name);

        if (context.mousePosition) {
            const mouseX = context.mousePosition.x;
            const mouseY = context.mousePosition.y;

            const uid = this.tAxis.toValue(mouseX);
            if (uid !== undefined && iterator.goTo(item => item.uid.compare(uid) === 0)) {
                const c = iterator.current;
                const text = c.toString(this.precision);
                this.qtip.addTextBlock('value', text);
            }
        }

        if (context.renderBase) {
            this.renderer.render(this.area.baseCanvas, iterator,
                                 { x: 0, y: 0, w: this.size.width, h: this.size.height },
                                 this.tAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }

    public isHit(mouseX: number, mouseY: number): boolean {

        // if (mouseX > 0 && mouseX < this.size.width
        //     && mouseY > 0 && mouseY < this.size.height) {

        //     const renderLocator = RenderLocator.Instance;
        //     // 1. Get approximate range
        //     // 2. Get data in that range            
        //     // 3. Test hit area
        //     //
        //     const indexRange = this.frame.getIndexesRange(mouseX - 10, mouseX + 10);
        //     if (indexRange && indexRange.start && indexRange.end) {
        //         const data = this.frame.getDataBetween(this._uid, indexRange.start, indexRange.end);
        //         //const dataIterator = this.dataSource.getData(dateRange, this.timeAxis.interval);
        //         const dataRender = <IChartRender<Candlestick>>renderLocator.getChartRender(Candlestick, this.chartType);
        //         const item = dataRender.testHitArea(
        //             { x: mouseX, y: mouseY },
        //             data,
        //             {x: 0, y: 0, w: this.size.width, h: this.size.height },
        //             this.frame.xAxis,
        //             this.yAxis);

        //         if (item) {
        //             // TODO: uncomment
        //             //this.popup.item = item;
        //             return true;
        //         }
        //     }
        // }
        return false;
    }

    public setPopupVisibility(visible: boolean): void {
        // TODO: uncomment
        //this.popup.visible = visible;
    }

    public getSettings(): SettingSet {
        const merged = new SettingSet('chartsettings');
        merged.setSetting('datasource', this.dataSource.getSettings());
        merged.setSetting('visual', this.renderer.getSettings());
        return merged;
    }

    public setSettings(settings: SettingSet): void {
        const renderSettings = settings.getSetting('chartsettings.visual');
        if (renderSettings) {
            this.renderer.setSettings(renderSettings);
        }

        const dsSettings = settings.getSetting('chartsettings.datasource');
        if (dsSettings) {
            this.dataSource.setSettings(dsSettings);
        }
    }
}
