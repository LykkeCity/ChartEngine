/**
 * Rainbow Indicator class.
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
import { IIndicator } from './Interfaces';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

export class RainbowCandlestick extends CandlestickExt {

    public line: (number|undefined)[] = [];

    public constructor(date: Date, c?: number, o?: number, h?: number, l?: number) {
        super(date, c, o, h, l);
    }

    public toString() {
        return '';
    }
}

export class RBIndicator extends SimpleIndicator<RainbowCandlestick> {

    private ma: IMovingAverageStrategy;
    private static periods = [9, 12, 15, 18, 21, 24, 27, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100];
    public static readonly K = RBIndicator.periods.length; // Amount of periods

    constructor (source: IDataSource<Candlestick>, addInterval: (date: Date) => Date) {
        super(RainbowCandlestick, source, addInterval);
        this.name = 'RB';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.Exponential);

        this.settings.period = Math.max(...RBIndicator.periods); // Taking max item as required amount of items
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         accessor: (candle: Candlestick) => number|undefined,
                         computedArray: FixedSizeArray<RainbowCandlestick>): RainbowCandlestick {

        const source = sourceItems.last();
        const lastComputed = computedArray.lastOrDefault();

        const computed = new RainbowCandlestick(source.date);
        computed.uidOrig.t = source.uid.t;
        computed.uidOrig.n = source.uid.n;

        const value = accessor(source);
        if (value !== undefined) {

            for (let i = 0; i < RBIndicator.K; i += 1) {
                const lastComputedValue = lastComputed !== undefined ? lastComputed.line[i] : undefined;
                computed.line[i] = this.ma.compute(RBIndicator.periods[i], sourceItems, accessor, undefined, lastComputedValue);
            }
        }

        return computed;
    }
}

export class RBIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        for (let i = 0; i < RBIndicator.K; i += 1) {
            const color = this.rainbow(RBIndicator.K, i);

            canvas.beginPath();
            canvas.setStrokeStyle(color);
            // Up
            RenderUtils.renderLineChart(canvas, data, item => {
                if (item instanceof RainbowCandlestick) {
                    const d = <RainbowCandlestick>item;
                    if (d && d.line[i] !== undefined) {
                        const value = d.line[i];
                        return { uid: item.uid, v: value };
                    }
                }
            }, frame, timeAxis, yAxis);
            canvas.stroke();
        }
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

    private rainbow(numOfSteps: number, step: number) {
            let r = 0.0;
            let g = 0.0;
            let b = 0.0;
            const h = step / numOfSteps;
            const i = Math.floor(h * 6);
            const f = h * 6.0 - i;
            const q = 1 - f;

            switch (i % 6) {
                case 0:
                    r = 1;
                    g = f;
                    b = 0;
                    break;
                case 1:
                    r = q;
                    g = 1;
                    b = 0;
                    break;
                case 2:
                    r = 0;
                    g = 1;
                    b = f;
                    break;
                case 3:
                    r = 0;
                    g = q;
                    b = 1;
                    break;
                case 4:
                    r = f;
                    g = 0;
                    b = 1;
                    break;
                case 5:
                    r = 1;
                    g = 0;
                    b = q;
                    break;
                default:
                    throw new Error('Invalid operation');
            }
            return '#'
             + ('00' + (parseInt((r * 255).toString(), 10)).toString(16)).slice(-2)
             + ('00' + (parseInt((g * 255).toString(), 10)).toString(16)).slice(-2)
             + ('00' + (parseInt((b * 255).toString(), 10)).toString(16)).slice(-2);
        }
}
