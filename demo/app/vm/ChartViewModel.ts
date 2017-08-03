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
import { PropsViewModel } from './PropsViewModel';
import { ItemSelectedArg, TreeViewModel } from './TreeViewModel';

const PANEL_WIDTH = 200;

export class ChartViewModel {

    private board: ChartBoard;
    private dataService: DataService;
    private dataSource: lychart.data.HttpDataSource;

    private node: HTMLElement;
    private $chartContainer: JQuery;
    private params: any;
    private actualIndicators: string[] = [];

    public treeVM: TreeViewModel;
    public propsVM: PropsViewModel;
    public editPropertiesMode = ko.observable(false);

    public visible = ko.observable(false);
    public width = ko.observable(0);
    public height = ko.observable(0);
    public assets = ko.observableArray<Asset>([]);
    public selectedAsset = ko.observable('BTCCHF');
    public selectedInterval = ko.observable('hour');
    public selectedChartType = ko.observable('candle');
    public selectedCompareAsset = ko.observable('BTCCHF');
    public selectedIndicators = ko.observableArray([]);

    public panelVisible = ko.observable(false);
    public panelWidth = ko.observable(44);
    public panelHeight = ko.observable(0);

    constructor(params: any, node: HTMLElement, assets: Asset[], dataService: DataService) {
        this.assets(assets);
        this.node = node;
        this.params = params;
        this.dataService = dataService;

        this.selectedAsset.subscribe(this.onAssetChanged);
        this.selectedInterval.subscribe(this.onIntervalChanged);
        this.selectedChartType.subscribe(this.onChartTypeChanged);
        this.selectedIndicators.subscribe(this.onIndicatorsChanged);

        this.$chartContainer = $('.chart-container', this.node);

        // Init chart board
        //
        const offset = this.$chartContainer.offset();
        this.board = new ChartBoard(
            this.$chartContainer[0], offset.left, offset.top, 200, 200, lychart.core.TimeInterval.min, new Storage(), this.dataService);
        this.board.objectSelected.on(this.board_onObjectSelected);
        this.board.objectTreeChanged.on(this.board_onObjectTreeChanged);
        console.log('cvm: chart board created.');

        // Init tree vm
        //
        this.treeVM = new TreeViewModel(this.board);
        this.treeVM.itemSelected.on(this.tree_onItemSelected);

        // Init props vm
        //
        this.propsVM = new PropsViewModel($('.properties', this.node)[0], this.board);
        this.propsVM.propsClosingEvent.on(this.props_onClosing);
        this.propsVM.propsAppliedEvent.on(this.props_onApplied);
    }

    public afterLoad() {
        if (this.params.loaded) {
            this.params.loaded(this);
        }
    }

    public cmdAddFigure(figureType: string) {
        if (figureType) {
            this.board.drawing.start(figureType);
        }
    }

    public cmdCompare() {

        const asset = this.selectedCompareAsset();
        const ds = this.dataService.createDataSource(asset, str2interval(this.selectedInterval()));
        this.board.addChart(lychart.utils.UidUtils.NEWUID(), asset, lychart.core.ChartType.candle, ds);
    }

    public cmdShowPanel(visible: boolean) {
        this.panelVisible(visible);
        this.panelWidth(visible ? PANEL_WIDTH : 44);
        this.resizeChartContainer();

        this.board.render();
    }

    public init(w: number, h: number, visible: boolean): boolean {
        console.log('cvm: initializing...');
        this.width(w);
        this.height(h);
        this.visible(visible);

        const initialized = this.resetChart();
        this.treeVM.update();
        if (initialized) {
            console.log('Initialized');
        } else {
            console.log('Not initialized');
        }
        return initialized;
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

    /* 
     * Event handlers
    */

    private onAssetChanged = () => {
        console.log('cvm: event "asset changed"');
        this.resetChart();
    }

    private onIntervalChanged = () => {
        console.log('cvm: event "interval changed"');
        this.resetChart();
    }

    private onChartTypeChanged = () => {
        this.board.setChartType(this.selectedChartType());
        this.treeVM.update();
        // this.board.render();
    }

    private onIndicatorsChanged = () => {
        const selected: string[] = this.selectedIndicators();

        const added = selected ? selected.filter(item => !this.actualIndicators.some(existing => existing === item)) : [];
        const removed = selected ? this.actualIndicators.filter(existing => !selected.some(sel => sel === existing)) : this.actualIndicators;
        added.forEach(indicator => {
            const splits = indicator.split('_');
            this.changeIndicator(splits[0], splits[0], parseInt(splits[1], 10), true);
        });
        removed.forEach(indicator => {
            const splits = indicator.split('_');
            this.changeIndicator(splits[0], splits[0], parseInt(splits[1], 10), false);
        });
        this.actualIndicators = selected ? selected : [];

        this.treeVM.update();
        this.board.render();
    }

    private tree_onItemSelected = (arg: ItemSelectedArg) => {
        this.propsVM.rebuild(arg.object);
        this.editPropertiesMode(true);
    }

    private props_onClosing = () => {
        this.editPropertiesMode(false);
    }

    private props_onApplied = () => {
        this.board.render();
    }

    private board_onObjectSelected = (arg: lychart.core.ObjectEventArgument) => {
        this.tree_onItemSelected(new ItemSelectedArg('', arg.obj));
    }

    private board_onObjectTreeChanged = (arg: lychart.core.EventArgument) => {
        this.treeVM.update();
    }

    private changeIndicator = (uid: string, indicatorType: string, index: number, state: boolean) => {
        if (state) {
            this.board.addIndicator(uid, indicatorType, index);
        } else {
            this.board.removeIndicator(uid);
        }
    }

    private resizeChartContainer() {
        // Compute size of chart based on component size and panels size
        //
        const w = this.width();
        const h = this.height();

        const $chartToolbar = $('.chart-toolbar', this.node);
        const chartH = Math.max(h - $chartToolbar.height(), 0);
        const chartW = Math.max(this.panelVisible() ? w - PANEL_WIDTH : w - 44, 0);

        // resize container
        //
        this.$chartContainer.height(chartH);
        this.$chartContainer.width(chartW);

        // resize board
        //
        this.board.resize(chartW, chartH);

        const offset = this.$chartContainer.offset();
        this.board.offset = new lychart.shared.Point(offset.left, offset.top);

        // resize panel
        this.panelHeight(chartH - 2);
    }

    /**
     * Changes chart to the selected asset pair and time interval.
     * @param assetPairId
     * @param timeInterval 
     */
    private setChart(assetPairId: string, timeInterval: lychart.core.TimeInterval): boolean {

        if (!assetPairId || !timeInterval) {
            return false;
        }

        if (this.dataSource) {
            this.dataSource.dispose();
        }

        console.log('cvm: creating data source...');
        // recreate data source
        this.dataSource =  this.dataService.createDataSource(assetPairId, timeInterval);

        this.board.setTimeInterval(timeInterval);
        this.board.setDataSource(
            assetPairId, // uid
            assetPairId, // name
            (timeInterval === lychart.core.TimeInterval.sec) ? lychart.core.ChartType.line : lychart.core.ChartType.candle,
            this.dataSource);

        return true;
    }

    private resetChart(): boolean {
        return this.setChart(this.selectedAsset(), str2interval(this.selectedInterval()));
    }
}

function str2interval(value: any): lychart.core.TimeInterval {
    const timeinterval: keyof typeof lychart.core.TimeInterval = value;
    return lychart.core.TimeInterval[timeinterval];
}
