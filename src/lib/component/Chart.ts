/**
 * Chart class.
 */
import { Events, IAxis, IConfigurable, IQuicktip, ITimeAxis, MouseEventArgument, SettingSet, TimeInterval, VisualComponent, VisualContext } from '../core/index';
import { IDataSource } from '../data/index';
import { ChartArea } from '../layout/index';
import { Candlestick, Uid } from '../model/index';
import { IChartRender, IRenderLocator, RenderLocator } from '../render/index';
import { IPoint, IRange, ISize, Point } from '../shared/index';
import { ChartPopup } from './ChartPopup';
import { IChart, IChartingSettings, IHoverable } from './Interfaces';
import { NumberMarker } from './NumberMarker';

export class Chart extends VisualComponent implements IChart, IHoverable, IConfigurable {
    private readonly area: ChartArea;
    private readonly tAxis: ITimeAxis;
    private readonly marker: NumberMarker;
    private readonly renderer: IChartRender<Candlestick>;
    private isMouseOver = false;

    constructor(
        uid: string,
        name: string,
        private readonly chartType: string,
        chartArea: ChartArea,
        tAxis: ITimeAxis,
        offset: Point,
        size: ISize,
        settings: IChartingSettings,
        private readonly dataSource: IDataSource<Candlestick>,
        private readonly yAxis: IAxis<number>,
        private readonly qtip: IQuicktip) {
        super(offset, size, uid, name);

        this.area = chartArea;
        this.tAxis = tAxis;

        this.marker = new NumberMarker(this.area.getYArea(), this.offset, this.size, yAxis, settings, this.getValue);
        this.marker.visible = true;
        this.addChild(this.marker);

        this.renderer = <IChartRender<Candlestick>>RenderLocator.Instance.getChartRender(Candlestick, this.chartType);
    }

    public get precision(): number {
        return this.dataSource.precision;
    }

    private getValue = (ctx: VisualContext, size: ISize) => {
        // toY(number) 
        const candle = this.dataSource.getLastCandle();
        return candle ? candle.c : undefined;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return this.dataSource.getValuesRange(range);
    }

    public handleMouse(relX: number, relY: number) {

        const iterator = this.dataSource.getIterator();

        this.qtip.removeTextBlock('name');
        this.qtip.removeTextBlock('value');
        this.qtip.addTextBlock('name', this.dataSource.name);

        const uid = this.tAxis.toValue(relX);
        if (uid !== undefined && iterator.goTo(item => item.uid.compare(uid) === 0)) {
            const c = iterator.current;
            const text = c.toString(this.precision);
            this.qtip.addTextBlock('value', text);
        }

        super.handleMouse(relX, relY);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {

        if (context.renderBase) {
            const iterator = this.dataSource.getIterator();
            this.renderer.render(this.area.baseCanvas, iterator,
                                 { x: 0, y: 0, w: this.size.width, h: this.size.height },
                                 this.tAxis, this.yAxis);
        }

        super.render(context, renderLocator);
    }

    public isHit(p: IPoint): boolean {
        return this.isMouseOver;
    }

    public setHovered(visible: boolean): void { }

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
