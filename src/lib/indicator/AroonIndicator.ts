/**
 * Aroon Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point, Uid } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class DoubleCandlestick extends CandlestickExt {

    public up: Candlestick;
    public down: Candlestick;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);

        this.up = new Candlestick(date);
        this.down = new Candlestick(date);
    }

    public toString(precision: number) {
        return `${this.up && this.up.c !== undefined ? this.up.c.toFixed(precision) : 'n/a'}`
            + ' / '
            + `${this.down && this.down.c !== undefined ? this.down.c.toFixed(precision) : 'n/a'}`;
    }
}

export class AroonIndicator extends SimpleIndicator<DoubleCandlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'ARO';

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>, accessor: IValueAccessor): DoubleCandlestick {

        return computeAroon(sourceItems, this.settings.period);
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            displayName: 'Period'
        }));

        group.setSetting('upperthreshold', new SettingSet({
            name: 'upperthreshold',
            value: this.settings.upperThreshold.toString(),
            settingType: SettingType.numeric,
            displayName: 'Upper threshold'
        }));

        group.setSetting('lowerthreshold', new SettingSet({
            name: 'lowerthreshold',
            value: this.settings.lowerThreshold.toString(),
            settingType: SettingType.numeric,
            displayName: 'Lower threshold'
        }));

        return group;
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: 0, end: 100 };
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        const upperthreshold = value.getSetting('datasource.upperthreshold');
        this.settings.upperThreshold =
            (upperthreshold && upperthreshold.value) ? parseInt(upperthreshold.value, 10) : this.settings.upperThreshold;

        const lowerthreshold = value.getSetting('datasource.lowerthreshold');
        this.settings.lowerThreshold =
            (lowerthreshold && lowerthreshold.value) ? parseInt(lowerthreshold.value, 10) : this.settings.lowerThreshold;

        // recompute
        this.compute();
    }
}

export class AroonOscillator extends SimpleIndicator<DoubleCandlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'AOS';

        // Set default settings
        this.settings.period = 14;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>, accessor: IValueAccessor): DoubleCandlestick {

        return computeAroon(sourceItems, this.settings.period);
    }

    public getValuesRange(range: IRange<Uid>): IRange<number> {
        return { start: -100, end: 100 };
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            displayName: 'Period'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        // recompute
        this.compute();
    }
}

export class AroonIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        // Start drawing
        canvas.beginPath();
        canvas.setStrokeStyle('#FF5900');
        // Up
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const d = <DoubleCandlestick>item;
                if (d && d.up && d.up.c !== undefined) {
                    const value = d.up.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();

        canvas.beginPath();
        canvas.setStrokeStyle('#3D5AFF');
        // Down
        RenderUtils.renderLineChart(canvas, data, item => {
            if (item instanceof DoubleCandlestick) {
                const d = <DoubleCandlestick>item;
                if (d && d.down && d.down.c !== undefined) {
                    const value = d.down.c;
                    return { uid: item.uid, v: value };
                }
            }
        }, frame, timeAxis, yAxis);
        canvas.stroke();
    }

    public testHitArea(
           hitPoint: IPoint,
           data: IDataIterator<Candlestick>,
           frame: IRect,
           timeAxis: ITimeAxis,
           yAxis: IAxis<number>): Candlestick | undefined {
               return undefined;
    }


    public getSettings(): SettingSet {
        return new SettingSet('visual');
    }

    public setSettings(settings: SettingSet): void {
    }
}

function computeAroon(sourceItems: FixedSizeArray<Candlestick>, period: number): DoubleCandlestick {

    const N = period;
    const source = sourceItems.last();

    const computed = new DoubleCandlestick(source.date);
    computed.uidOrig.t = source.uid.t;
    computed.uidOrig.n = source.uid.n;

    const indexOfHighest = sourceItems.maxIndex(item => item.h);
    const indexOfLowest = sourceItems.minIndex(item => item.l);

    if (indexOfHighest >= 0) {
        const daySince = sourceItems.length - (indexOfHighest + 1);
        const indicator = 100 * (N - daySince) / N;
        computed.up.c = indicator;
        computed.up.h = indicator;
        computed.up.l = indicator;
    }

    if (indexOfLowest >= 0) {
        const daySince = sourceItems.length - (indexOfLowest + 1);
        const indicator = 100 * (N - daySince) / N;
        computed.down.c = indicator;
        computed.down.h = indicator;
        computed.down.l = indicator;
    }

    // Aroon oscillator = Aroon-Up - Aroon-Down
    if (computed.up.c !== undefined && computed.down.c !== undefined) {
        computed.c = computed.up.c - computed.down.c;
        computed.h = computed.c;
        computed.l = computed.c;
    }

    return computed;
}
