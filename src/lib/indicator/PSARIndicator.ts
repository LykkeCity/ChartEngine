/**
 * Parabolic Stop and Reverse indicator class.
 */
import { ICanvas } from '../canvas/index';
import { IAxis, IPoint, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// SAR(n+1) = SAR(n) + A x (EP - SAR(n))

export enum Trend {
    None = 0,
    Up = 1,
    Down = 2
}

export class PSARCandlestick extends CandlestickExt {
    /**
     * Acceleration factor
     */
    public a: number|undefined;

    /**
     * Extreme point. Highest high (uptrend, long) or Lowest low (downtrend, short).
     */
    public EP: number|undefined;

    /**
     * Leading Span A
     */
    public SAR: number | undefined;

    public trend: Trend = Trend.None;

    public toString(precision: number) {
        return 'SAR: '
            + `${this.SAR !== undefined ? this.SAR.toFixed(precision) : 'n/a'}`
            + ' / EP: '
            + `${this.EP !== undefined ? this.EP.toFixed(precision) : 'n/a'}`;
    }
}

export class PSARIndicator extends SimpleIndicator<PSARCandlestick> {

    private ema: IMovingAverageStrategy;
    private extsettings: PSARSettings = new PSARSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(PSARCandlestick, source, context);
        this.name = 'PSAR';
    }

    protected get requiredItemsOnCompute(): number {
        return 3;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<PSARCandlestick>
                         ): PSARCandlestick {

        const initialFactor = this.extsettings.initialFactor;
        const increment = this.extsettings.increment;
        const maxFactor = this.extsettings.maxFactor;

        const sourceCur = sourceItems.last(); // source must contain at least one item.
        const sourcePrev = sourceItems.length > 1 ? sourceItems.getItem(sourceItems.length - 2) : undefined;
        const lastComputed = computedArray.lastOrDefault(); // computed can contain no items.

        const computed = new PSARCandlestick(sourceCur.date);
        computed.uidOrig.t = sourceCur.uid.t;
        computed.uidOrig.n = sourceCur.uid.n;

        if (sourceCur.h === undefined || sourceCur.l === undefined) {
            if (lastComputed !== undefined) {
                computed.a = lastComputed.a;
                computed.EP = lastComputed.EP;
                computed.SAR = lastComputed.SAR;
                computed.trend = lastComputed.trend;
            }
        } else {
            if (lastComputed !== undefined && lastComputed.SAR !== undefined) {
                // 1. Compute SAR
                //
                let SAR;
                const SARprev = lastComputed.SAR;
                const a = <number>lastComputed.a;
                const EP = <number>lastComputed.EP;
                const trend = lastComputed.trend;

                if (trend === Trend.Up) {
                    SAR = SARprev + a * (EP - SARprev);
                } else if (trend === Trend.Down) {
                    SAR = SARprev - a * (SARprev - EP);
                } else {
                    throw new Error('Undefined trend.');
                }

                // 2. Correct SAR. SAR can't get inside or beyound previous (2) range.
                //
                if (sourcePrev !== undefined && sourcePrev.h !== undefined && sourcePrev.l !== undefined) {
                    if ( trend === Trend.Up && SAR > sourcePrev.l ) { // SAR in prev range or beyond
                        // correct SAR
                        SAR = sourcePrev.l;
                    } else if (trend === Trend.Down && SAR < sourcePrev.h) {
                        SAR = sourcePrev.h;
                    }
                }

                // 3. Check if trend changes or continues
                //
                if ((trend === Trend.Up && SAR > sourceCur.l)
                     || (trend === Trend.Down && SAR < sourceCur.h) ) { // SAR in cur range or beyond
                    // Trend changes
                    computed.trend = trend === Trend.Up ? Trend.Down : Trend.Up;
                    computed.a = initialFactor;
                    computed.EP = trend === Trend.Up ? sourceCur.l : sourceCur.h;
                    computed.SAR = EP; // New SAR is EP from previous trend
                } else {
                    // Trend continues
                    computed.trend = trend;
                    computed.SAR = SAR;
                    computed.EP = trend === Trend.Up ? Math.max(EP, sourceCur.h) : Math.min(EP, sourceCur.l);
                    // Increment "a" if new highest high or lowest low. If HH / LL is not changed, do not increment "a".
                    computed.a = (computed.EP !== EP) ? Math.min(a + increment, maxFactor) : a;
                }

            } else {
                // Computing first SAR
                computed.trend = Trend.Up;
                computed.a = initialFactor;
                computed.EP = sourceCur.h;
                computed.SAR = sourceCur.l;
            }
        }
        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('initialFactor', new SettingSet({
            name: 'initialFactor',
            value: this.extsettings.initialFactor.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Initial factor'
        }));

        group.setSetting('increment', new SettingSet({
            name: 'increment',
            value: this.extsettings.increment.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Increment'
        }));

        group.setSetting('maxFactor', new SettingSet({
            name: 'maxFactor',
            value: this.extsettings.maxFactor.toString(),
            settingType: SettingType.numeric,
            dispalyName: 'Maximum factor'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const initialFactor = value.getSetting('datasource.initialFactor');
        this.extsettings.initialFactor = (initialFactor && initialFactor.value) ? parseInt(initialFactor.value, 10) : this.extsettings.initialFactor;

        const increment = value.getSetting('datasource.increment');
        this.extsettings.increment = (increment && increment.value) ? parseInt(increment.value, 10) : this.extsettings.increment;

        const maxFactor = value.getSetting('datasource.maxFactor');
        this.extsettings.maxFactor = (maxFactor && maxFactor.value) ? parseInt(maxFactor.value, 10) : this.extsettings.maxFactor;

        // recompute
        this.compute();
    }
}

class PSARSettings {
    public initialFactor: number = 0.02;
    public increment: number = 0.02;
    public maxFactor: number = 0.2;
}

export class PSARIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        RenderUtils.iterate(timeAxis, data, (item, x) => {

            const curItem = (item instanceof PSARCandlestick) ? <PSARCandlestick>item: undefined;

            if (curItem && curItem.SAR !== undefined) {

                const y = yAxis.toX(curItem.SAR);

                canvas.beginPath();
                if (curItem.trend === Trend.Up) {
                    canvas.setStrokeStyle('#56B50E');
                    canvas.setFillStyle('#56B50E');
                } else {
                    canvas.setStrokeStyle('#EA0E1C');
                    canvas.setFillStyle('#EA0E1C');
                }

                canvas.arc(x, y, 2, 0, 360);
                canvas.fill();
                canvas.stroke();
            }

        });

        // timeAxis.reset();
        // while (timeAxis.moveNext()) {
        //     const curUid = timeAxis.current;
        //     const curTime = curUid.t.getTime();
        //     const curn = curUid.n;
        //     const x = timeAxis.currentX;

        //     if (!found) {
        //         found = data.goTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn);
        //     } else {
        //         found = data.moveTo(item => item.uid.t.getTime() === curTime && item.uid.n === curn) !== -1;
        //     }

        //     if (found) {

        //         const curItem = (data.current instanceof PSARCandlestick) ? <PSARCandlestick>data.current : undefined;

        //         if (curItem && curItem.SAR !== undefined) {

        //             const y = yAxis.toX(curItem.SAR);

        //             canvas.beginPath();
        //             if (curItem.trend === Trend.Up) {
        //                 canvas.setStrokeStyle('#56B50E');
        //                 canvas.setFillStyle('#56B50E');
        //             } else {
        //                 canvas.setStrokeStyle('#EA0E1C');
        //                 canvas.setFillStyle('#EA0E1C');
        //             }

        //             canvas.arc(x, y, 2, 0, 360);
        //             canvas.fill();
        //             canvas.stroke();
        //         }
        //     }
        // }
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
        return new SettingSet('renderer');
    }

    public setSettings(settings: SettingSet): void {
    }
}
