/**
 * Highest High / Lowest Low Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IndicatorDataSource } from './IndicatorDataSource';
import { IContext, IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class DoubleCandlestick extends CandlestickExt {

    public hh: Candlestick;
    public ll: Candlestick;

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);

        this.hh = new Candlestick(date);
        this.ll = new Candlestick(date);
    }

    public toString() {
        return `${this.hh && this.hh.c !== undefined ? this.hh.c.toFixed(4) : 'n/a'}`
            + ' / '
            + `${this.ll && this.ll.c !== undefined ? this.ll.c.toFixed(4) : 'n/a'}`;
    }
}

export class HHLLIndicator extends SimpleIndicator<DoubleCandlestick> {

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(DoubleCandlestick, source, context);
        this.name = 'HHLL';

        // Set default settings
        this.settings.period = 10;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<DoubleCandlestick>): DoubleCandlestick {

            const N = this.settings.period;

            const source = sourceItems.last();

            const computed = new DoubleCandlestick(source.date);
            computed.uidOrig.t = source.uid.t;
            computed.uidOrig.n = source.uid.n;

            const hh = sourceItems.max(item => item.h);
            const ll = sourceItems.min(item => item.l);

            computed.hh.c = hh;
            computed.hh.h = hh;
            computed.hh.l = hh;

            computed.ll.c = ll;
            computed.ll.h = ll;
            computed.ll.l = ll;

            return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Period'
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

export class HHLLIndicatorRenderer implements IChartRender<Candlestick> {

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
                if (d && d.hh && d.hh.c !== undefined) {
                    const value = d.hh.c;
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
                if (d && d.ll && d.ll.c !== undefined) {
                    const value = d.ll.c;
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
