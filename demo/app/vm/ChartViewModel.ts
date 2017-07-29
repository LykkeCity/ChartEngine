/**
 * ChartViewModel class. View model of a specific chart.
 */
import * as lychart from '../../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import Candlestick = lychart.model.Candlestick;
import Uid = lychart.model.Uid;
import DateUtils = lychart.utils.DateUtils;

import { Asset } from '../model/Asset';
import { DataService } from '../services/DataService';
import { Storage } from '../services/Storage';

export class ChartViewModel {

    private board: ChartBoard;
    private dataService: DataService;
    private dataSource: lychart.data.HttpDataSource;

    private node: HTMLElement;
    private $chartContainer: JQuery;
    private params: any;

    public visible = ko.observable(false);
    public width = ko.observable(0);
    public height = ko.observable(0);
    public assets = ko.observableArray<Asset>([]);
    public selectedAsset = ko.observable('BTCUSD');
    public selectedInterval = ko.observable('hour');

    public panelVisible = ko.observable(false);
    public panelWidth = ko.observable(44);

    constructor(params: any, node: HTMLElement, assets: Asset[], dataService: DataService) {
        this.assets(assets);
        this.node = node;
        this.params = params;
        this.dataService = dataService;

        this.$chartContainer = $('.chart-container', this.node);

        const offset = this.$chartContainer.offset();
        this.board = new ChartBoard(
            this.$chartContainer[0], offset.left, offset.top, 200, 200, lychart.core.TimeInterval.min, new Storage(), this.dataService);
        console.log('cvm: chart board created...');
    }

    public afterLoad() {
        if (this.params.loaded) {
            this.params.loaded(this);
        }
    }

    public cmdShowPanel(visible: boolean) {
        this.panelVisible(visible);
        this.panelWidth(visible ? 100 : 44);
        this.resizeChartContainer();

        this.board.render();
    }

    public init(w: number, h: number, visible: boolean): void {
        console.log('cvm: initializing...');
        this.width(w);
        this.height(h);
        this.visible(visible);

        // const offset = this.$chartContainer.offset();
        // this.board = new ChartBoard(
        //     this.$chartContainer[0], offset.left, offset.top, 200, 200, lychart.core.TimeInterval.min, new Storage(), this.dataService);
        //console.log('cvm: chart board created...');

        this.setChart(this.selectedAsset(), str2interval(this.selectedInterval()));
    }

    public resize(w: number, h: number): void {
        this.width(w);
        this.height(h);
        this.resizeChartContainer();

        this.board.render();
    }

    public setVisible(value: boolean) {
        this.visible(value);
    }

    private resizeChartContainer() {
        // Compute size of chart based on component size and panels size
        //
        const w = this.width();
        const h = this.height();

        const $chartToolbar = $('.chart-toolbar', this.node);
        const chartH = Math.max(h - $chartToolbar.height(), 0);
        const chartW = Math.max(this.panelVisible() ? w - 100 : w - 44, 0);

        this.$chartContainer.height(chartH);
        this.$chartContainer.width(chartW);

        // Resize board
        this.board.resize(chartW, chartH);

        //const rect = this.container.getBoundingClientRect();
        const offset = this.$chartContainer.offset();
        this.board.offset = new lychart.shared.Point(offset.left, offset.top + $chartToolbar.height());
    }

    /**
     * Changes chart to the selected asset pair and time interval.
     * @param assetPairId
     * @param timeInterval 
     */
    private setChart(assetPairId: string, timeInterval: lychart.core.TimeInterval) {

        // if (!assetPairId || !timeInterval) {
        //     return;
        // }

        // if (this.dataSource) {
        //     this.dataSource.dispose();
        // }

        // // recreate data source
        // this.dataSource =  this.dataService.createDataSource(assetPairId, timeInterval);

        // this.board.setTimeInterval(timeInterval);
        // this.board.setDataSource(assetPairId, // uid
        //                          assetPairId, // name
        //                          (timeInterval === lychart.core.TimeInterval.sec) ? lychart.core.ChartType.line : lychart.core.ChartType.candle,
        //                          this.dataSource);
    }
}

function str2interval(value: any): lychart.core.TimeInterval {
    const timeinterval: keyof typeof lychart.core.TimeInterval = value;
    return lychart.core.TimeInterval[timeinterval];
}
