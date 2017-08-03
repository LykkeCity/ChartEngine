/**
 * AppViewModel class. Master view model of the app.
 */
import { Asset } from '../model/Asset';
import { AssetService, DataService } from '../services/DataService';
import { ChartViewModel } from './ChartViewModel';

export class AppViewModel {

    private $frame: JQuery;
    private frameSize = { width: 0, height: 0 };

    private mode = 1;
    private charts: ChartViewModel[] = [];
    private selectedChart: ChartViewModel|undefined;
    private initialized: boolean[] = [];
    private assets: Asset[] = [];
    private dataService = new DataService();

    public figures = ko.observableArray([
        { name: 'line', text: 'Line' },
        { name: 'hline', text: 'H-Line' },
        { name: 'vline', text: 'V-Line' },
        { name: 'rect', text: 'Rect' },
        { name: 'triangle', text: 'Triangle' },
        { name: 'path', text: 'Path' },
        { name: 'pitchfork', text: 'Pitchfork' },
        { name: 'text', text: 'Text' },
        { name: 'ellipse', text: 'Ellipse' },
        { name: 'trendchannel', text: 'Trend Channel' },
        { name: 'curve', text: 'Curve' },
        { name: 'daterange', text: 'Date Range' },
        { name: 'fibofan', text: 'Fibo Fan' },
        { name: 'fibolevel', text: 'Fibo Level' },
        { name: 'fiboprojection', text: 'Fibo Projection' },
        { name: 'fibotimeprojection', text: 'Fibo Time Projection' },
        { name: 'gannfan', text: 'Gann Fan' },
        { name: 'ohlcproj', text: 'OHLC Proj' }
    ]);

    public cmdAddFigure(figureName: string) {
        // close popup
        $('#popupMenu').popup('close');

        // start drawing
        if (this.selectedChart) {
            this.selectedChart.cmdAddFigure(figureName);
        }
    }

    public cmdSetCurrentChart(vm: ChartViewModel) {
        this.selectedChart = vm;
    }

    public async init(): Promise<void> {
        this.$frame = $('#frame');

        this.resizeFrame($(window).width(), $(window).height());

        console.log('Loading assets.');

        try {
            this.assets = await AssetService.getAssets();
            console.log('Assets are loaded.');

            for (const chart of this.charts) {
                chart.assets(this.assets);
            }

            this.initChildComponents();
        } catch (e) {
            console.error('Error during loading: ' + e);
        }
    }

    public insertChart(index: number, params: any, node?: Node): ChartViewModel {
        if (!node) {
            throw new Error('Node must be specified.');
        }

        if (this.charts[index] === undefined) {
            this.charts[index] = new ChartViewModel(params, <HTMLElement>node, this.assets, this.dataService);
            this.initialized[index] = false;
            return this.charts[index];
        } else {
            throw new Error(`Chart is already created at index = ${index}.`);
        }
    }

    public onComponentLoaded = (chartComponent: ChartViewModel) => {
    }

    public onready = () => {
        this.updateChildComponents();
    }

    public onresize = (size: any) => {
        this.resizeFrame(size.width, size.height);
        this.updateChildComponents();
    }

    public setMode(n: number): void {
        this.mode = n;
        this.updateChildComponents();
    }

    private resizeFrame(w: number, h: number) {
        this.frameSize = { width: w, height: h };
        this.$frame.height(h - 2);
    }

    private initChildComponents() {
        this.charts.forEach((chart, index) => {
            if (!this.initialized[index]) {
                const layout = this.getChartLayout(index);
                this.initialized[index] = chart.init(layout.w, layout.h, layout.v);
            }
        });
    }

    private updateChildComponents() {
        this.charts.forEach((c, i) => {
            const layout = this.getChartLayout(i);
            c.setVisible(layout.v);
            c.resize(layout.w, layout.h);
        });
    }

    private getChartLayout(chartIndex: number): ILayout {
        const frameHeight = this.frameSize.height - 50;
        const frameWidth = this.frameSize.width - 6;
        if (chartIndex === 0) {
            return this.mode === 1
                ? { w: this.frameSize.width , h: frameHeight - 2, v: true }
                : { w: frameWidth / 2 , h: frameHeight / 2 - 2, v: true };
        } else {
            return this.mode === 1
                ? { w: frameWidth / 2, h: frameHeight / 2 - 2, v: false }
                : { w: frameWidth / 2 , h: frameHeight / 2 - 2, v: true };
        }
    }
}

interface ISize {
    w: number;
    h: number;
}

interface ILayout {
    w: number;
    h: number;
    v: boolean;
}
