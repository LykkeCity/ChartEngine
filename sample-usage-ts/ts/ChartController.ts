/**
 * ChartController class.
 */
import * as lychart from '../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import Candlestick = lychart.model.Candlestick;
import { Asset } from './Asset';
import { Settings } from './Settings';
import { Utils } from './Utils';

/**
 * Creates and handles one chart and its controls.
 */
export class ChartController {
    private container: HTMLElement;
    private board: ChartBoard;
    private readonly uid: string = '1';
    private dataSource?: lychart.data.HttpDataSource<lychart.model.Candlestick>;
    private selectedInterval: lychart.core.TimeInterval;
    private selectedAsset: string;
    private autoupdateTimer?: number;
    private readonly autoupdatePeriod = 10; // In seconds

    constructor(container: HTMLElement, offsetLeft: number, offsetTop: number, assets: Asset[], selectedAsset: string) {
        this.container = container;
        this.selectedAsset = selectedAsset;
        this.selectedInterval = this.getSelectedTimeInterval();

        // Create chart
        const chartContainer = <HTMLElement>container.getElementsByClassName('chart-container')[0];
        this.board = new ChartBoard(chartContainer, offsetLeft, offsetTop, 200, 200, lychart.core.TimeInterval.min);

        // Set up controls
        //

        // init <select>
        $.each(assets, (i, item) => {
            $('.assetpair', this.container).append($('<option></option>').val(item.id).html(item.name));
        });
        $('.assetpair', this.container).val(selectedAsset); // select default value

        // Hook up event handlers
        $('.add-line', container).click(this.onAddLine);
        $('.add-rect', container).click(this.onAddRect);
        $('.add-circle', container).click(this.onAddCircle);

        $('.assetpair', this.container).change(this.updateChart);
        $('.timeinterval', this.container).change(this.updateChart);
        this.updateChart();

        // Set up auto update timer
        this.autoupdateTimer = setTimeout(this.autoUpdate, this.autoupdatePeriod * 1000);
    }

    /**
     * Resizes chart to half of the window
     */
    public resize(): void {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        const chartW = (windowWidth - 30) / 2;
        const chartH = windowHeight - 60;

        // Update board's size
        this.board.resize(chartW, chartH);

        // Update board's offset
        const rect = this.container.getBoundingClientRect();
        this.board.offset = new lychart.shared.Point(rect.left, rect.top + 40);

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
            .then(response => {
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

    private onAddLine = (evt: JQueryEventObject) => {
        this.board.drawing.start('line');
    }

    private readData = (timeStart: Date, timeEnd: Date, interval: lychart.core.TimeInterval) => {
        $.support.cors = true;

        const settings = {
            method: 'POST',
            crossDomain: true,
            dataType: 'json',
            url: Settings.candlesUrl + this.selectedAsset,
            contentType: 'application/json',
            data: JSON.stringify({
                period: Utils.INTERVAL2PERIOD(interval),
                type: 'Bid',
                dateFrom: timeStart.toISOString(),
                dateTo: timeEnd.toISOString()
            })
        };
        return $.ajax(settings);
    }

    /**
     * Converts json from server to model.
     */
    private resolveData = (response: any): lychart.data.IResponse<lychart.model.Candlestick> => {
        if (response) {
            const data = response.data
                .map((item: any) => {
                    return new lychart.model.Candlestick(new Date(item.t), item.c, item.o, item.h, item.l);
                });

            return {
                startDateTime: response.dateFrom,
                endDateTime: response.dateTo,
                interval: Utils.PERIOD2INTERVAL(response.period),
                data: data
            };
        }
        return {
            startDateTime: new Date(),
            endDateTime: new Date(),
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
            this.board.removeChart(this.uid);
            this.dataSource.dispose();
        }

        // recreate data source
        this.dataSource = new lychart.data.HttpDataSource(
            lychart.model.Candlestick,
            {
                url: '',
                autoupdate: false,
                readData: this.readData,
                resolveData: this.resolveData,
                timeInterval: timeInterval
            });

        this.board.setTimeInterval(timeInterval);
        this.board.addChart(this.uid,
                            (timeInterval === lychart.core.TimeInterval.sec) ? lychart.core.ChartType.line : lychart.core.ChartType.candle,
                            this.dataSource);
    }

    private updateChart = () => {
        this.setChart(this.getSelectedAssetPair(), this.getSelectedTimeInterval());
        this.board.render();
    }
}
