/**
 * ChartController class.
 */
import * as lychart from '../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import Candlestick = lychart.model.Candlestick;
import Uid = lychart.model.Uid;
import DateUtils = lychart.utils.DateUtils;
import { Asset } from './Asset';
import { Settings } from './Settings';
import { Utils } from './Utils';

import { FormProps } from './FormProps';
import { FormTree, ItemSelectedArg } from './FormTree';

/**
 * Creates and handles one chart and its controls.
 */
export class ChartController implements lychart.core.IDataService {
    private readonly autoupdatePeriod = 10; // In seconds
    private autoupdateTimer?: number;
    private board: ChartBoard;
    private container: HTMLElement;
    private dataSource?: lychart.data.HttpDataSource; //<lychart.model.Candlestick>;
    private selectedInterval: lychart.core.TimeInterval;
    private selectedAsset: string;
    private storage = new Storage();
    private readonly uid: string = '1';
    private indicators: string[] = [];
    private tree: FormTree;
    private props: FormProps;

    constructor(container: HTMLElement, offsetLeft: number, offsetTop: number, assets: Asset[], selectedAsset: string) {
        this.container = container;
        this.selectedAsset = selectedAsset;
        this.selectedInterval = this.getSelectedTimeInterval();

        // Create chart
        const chartContainer = <HTMLElement>container.getElementsByClassName('chart-container')[0];
        this.board = new ChartBoard(chartContainer, offsetLeft, offsetTop, 200, 200, lychart.core.TimeInterval.min, this.storage, this);

        // Set up controls
        //

        // init <select>
        $.each(assets, (i, item) => {
            $('.assetpair', this.container).append($('<option></option>').val(item.id).html(item.name));
            $('.assetpair-compare', this.container).append($('<option></option>').val(item.id).html(item.name));
        });
        $('.assetpair', this.container).val(selectedAsset); // select default value

        // Hook up event handlers
        $('.add-compare', container).click(this.onAddCompare);
        $('.add-line', container).click(this.onAddLine);
        $('.add-hline', container).click(this.onAddHLine);

        const $sel = $('#sel-indicators').select2({ theme: 'classic' });
        $sel.on('change', this.onIndicatorsChange);

        $('.assetpair', this.container).change(this.updateChart);
        $('.timeinterval', this.container).change(this.updateChart);
        $('.charttype', this.container).change(this.onChartTypeChange);
        this.updateChart();

        this.tree = new FormTree($('.tree', '#panel')[0], this.board);
        //this.props = new FormProps($('.props', '#panel')[0]);
        this.tree.itemSelected.on(this.onItemSelected);

        this.tree.update();

        // Set up auto update timer
        // this.autoupdateTimer = setTimeout(this.autoUpdate, this.autoupdatePeriod * 1000);
    }

    private changeIndicator = (uid: string, indicatorType: string, index: number, state: boolean) => {
        if (state) {
            this.board.addIndicator(uid, indicatorType, index);
        } else {
            this.board.removeIndicator(uid);
        }
        this.tree.update();
        this.board.render();
    }

    private onIndicatorsChange = () => {
        const $sel = $('#sel-indicators');
        const selected: string[] = $sel.val();
        const added = selected ? selected.filter(item => !this.indicators.some(existing => existing === item)) : [];
        const removed = selected ? this.indicators.filter(existing => !selected.some(sel => sel === existing)) : this.indicators;
        added.forEach(indicator => {
            const splits = indicator.split('_');
            this.changeIndicator(splits[0], splits[0], parseInt(splits[1], 10), true);
        });
        removed.forEach(indicator => {
            const splits = indicator.split('_');
            this.changeIndicator(splits[0], splits[0], parseInt(splits[1], 10), false);
        });
        this.indicators = selected ? selected : [];
    }

    private onItemSelected = (arg: ItemSelectedArg) => {
        this.tree.hide();
        this.props = new FormProps($('.properties', '#panel')[0], this.board, arg.uid, arg.object);
        this.props.propsClosingEvent.on(this.onPropsClosing);
        this.props.propsAppliedEvent.on(this.onPropsApplied);
        this.props.show();
    }

    private onChartTypeChange = () => {
        this.board.setChartType( this.getSelectedChartType() );
        this.tree.update();
        this.board.render();
    }

    private onPropsClosing = () => {
        this.props.hide();
        this.tree.show();
    }

    private onPropsApplied = () => {
        this.board.render();
    }

    /**
     * Resizes chart to half of the window
     */
    public resize(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const chartW = this.container.clientWidth - 20; // (windowWidth - 30) - 200 ; // /2
        const chartH = windowHeight - 70;

        // Update board's size
        this.board.resize(chartW, chartH);

        // Update board's offset
        const rect = this.container.getBoundingClientRect();
        this.board.offset = new lychart.shared.Point(rect.left, rect.top + 50);

        // Re-render
        this.board.render();
    }

    /**
     * Timer event handler. Updates chart.
     */
    private autoUpdate = () => {
        // Updating last candle (time period is one interval)
        const end = new Date();
        const start = new Date(end.getTime() - this.selectedInterval);

        // Read last candle from server and push to the chart
        this.readData(start, end, this.selectedInterval)
            .then(this.resolveData)
            .then((response: any) => {
                // Take last candle and push it to data source
                if (response && response.data && response.data.length > 0 && this.dataSource) {
                    const lastCandle = response.data[response.data.length - 1];
                    this.dataSource.merge([lastCandle]);
                }
            });

        this.board.render();

        // schedule next autoupdate
        this.autoupdateTimer = setTimeout(this.autoUpdate, this.autoupdatePeriod * 1000);
    }

    private getSelectedTimeInterval(): lychart.core.TimeInterval {
        const timeinterval: keyof typeof lychart.core.TimeInterval  = $('.timeinterval option:selected', this.container).val();
        return lychart.core.TimeInterval[timeinterval];
    }

    private getSelectedAssetPair(): string {
        return $('.assetpair option:selected', this.container).val();
    }

    private getSelectedChartType(): string {
        return $('.charttype option:selected', this.container).val();
    }

    private onAddCompare = (evt: JQueryEventObject) => {
        const asset = $('.assetpair-compare option:selected', this.container).val();
        if (asset) {
            const ds = this.createDataSource(asset, this.selectedInterval);
            this.board.addChart(lychart.utils.UidUtils.NEWUID(), asset, lychart.core.ChartType.candle, ds);
        }
    }

    private onAddLine = (evt: JQueryEventObject) => {
        this.board.drawing.start('line');
    }

    private onAddHLine = (evt: JQueryEventObject) => {
        this.board.drawing.start('horizon-line');
    }

    public getCandle(asset: string, date: Date, interval: lychart.core.TimeInterval): Promise<Candlestick> {

        return new Promise<Candlestick>(resolve => {
            this.readData(date, DateUtils.addInterval(date, interval), interval)
            .then((response: any) => { return this.resolveData(response); })
            .then((resolved: lychart.data.IResponse<lychart.model.Candlestick>) => {
                resolve(resolved.data.length > 0 ? resolved.data[0] : undefined);
            });
        });
    }

    private createDataReader(selectedAsset: string) {

        return (timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) => {
            $.support.cors = true;

            const settings = {
                method: 'POST',
                crossDomain: true,
                dataType: 'json',
                url: Settings.candlesUrl + selectedAsset,
                contentType: 'application/json',
                data: JSON.stringify({
                    period: Utils.INTERVAL2PERIOD(interval),
                    type: 'Bid',
                    dateFrom: timeStart.toISOString(),
                    dateTo: timeEnd.toISOString()
                })
            };
            return $.ajax(settings);
        };
    }

    private defaultReader: any;

    private readData = (timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) => {
        if (!this.defaultReader) {
            this.defaultReader = this.createDataReader(this.selectedAsset);
        }
        return this.defaultReader(timeStart, timeEnd, interval);
    }

    /**
     * Converts json from server to model.
     */
    private resolveData = (response: any): lychart.data.IResponse<lychart.model.Candlestick> => {
        if (response) {
            const data = response.data
                .map((item: any) => {

                    const date = new Date(item.t);
                    const stick = new lychart.model.Candlestick(date, item.c, item.o, item.h, item.l);
                    // init uid
                    stick.uid = new Uid(date); // date.getTime().toString();
                    return stick;
                });

            return {
                dateFrom: new Date(response.dateFrom),
                dateTo: new Date(response.dateTo),
                interval: Utils.PERIOD2INTERVAL(response.period),
                data: data
            };
        }
        return {
            dateFrom: new Date(),
            dateTo: new Date(),
            interval: lychart.core.TimeInterval.notSet,
            data: []
        };
    }

    /**
     * Changes chart to the selected asset pair and time interval.
     * @param assetPairId
     * @param timeInterval 
     */
    private setChart(assetPairId: string, timeInterval: lychart.core.TimeInterval) {
        this.selectedAsset = assetPairId;
        this.selectedInterval = timeInterval;

        if (this.dataSource) {
            //this.board.removeChart(this.uid);
            this.dataSource.dispose();
        }

        // recreate data source
        this.dataSource = this.createDataSource(assetPairId, timeInterval);

        this.board.setTimeInterval(timeInterval);
        this.board.setDataSource(assetPairId,
                                 (timeInterval === lychart.core.TimeInterval.sec) ? lychart.core.ChartType.line : lychart.core.ChartType.candle,
                                 this.dataSource, false);
    }

    private createDataSource(assetPairId: string, timeInterval: lychart.core.TimeInterval) {
        const dataSource = new lychart.data.HttpDataSource(
            lychart.model.Candlestick,
            {
                url: '',
                autoupdate: false,
                readData: this.createDataReader(assetPairId), // this.readData,
                resolveData: this.resolveData,
                timeInterval: timeInterval
            });
        dataSource.asset = assetPairId;
        return dataSource;
    }

    private updateChart = () => {
        this.setChart(this.getSelectedAssetPair(), this.getSelectedTimeInterval());
        this.board.render();
    }
}

class Storage implements lychart.core.IStorage {
    public getItem(key: string): string | null {
        if (localStorage) {
            return localStorage.getItem(key);
        } else {
            throw new Error('Local storage is not available.');
        }
    }

    public setItem(key: string, value: string) {
        if (localStorage) {
            localStorage.setItem(key, value);
        } else {
            throw new Error('Local storage is not available.');
        }
    }
}
