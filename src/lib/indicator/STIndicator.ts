/**
 * Supertrend Indicator class.
 */
import { ICanvas } from '../canvas/index';
import { TrueRangeExtension } from '../compute/index';
import { ChartPoint, IAxis, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { ArrayDataStorage, DataChangedArgument, DataSource,
    DataSourceConfig, IContext, IDataIterator, IDataSource, IDataStorage } from '../data/index';
import { Candlestick, Point } from '../model/index';
import { IChartRender, RenderUtils } from '../render/index';
import { FixedSizeArray, IPoint, IRange, IRect } from '../shared/index';
import { CandlestickExt } from './CandlestickExt';
import { IMovingAverageStrategy, MovingAverageFactory, MovingAverageType } from './MovingAverage';
import { SimpleIndicator } from './SimpleIndicator';
import { Utils } from './Utils';
import { IValueAccessor, ValueAccessorFactory, ValueAccessorType } from './ValueAccessor';

// Upper = hl2 + M x ATR (if Close > ST prev on down trend)
// Lower = hl2 - M x ATR (if Close < ST prev on upper trend)

export enum Type {
    Undef = 0,
    Up = 1,
    Down = 2
}

export class STCandlestick extends CandlestickExt {
    /**
     * ATR value
     */
    public ATR: number|undefined;

    public trendUp: number|undefined;
    public trendDown: number|undefined;
    public trend: Type = Type.Undef;

    public toString(precision: number) {
        return `${this.c !== undefined ? this.c.toFixed(precision) : 'n/a'}`;
    }
}

export class STIndicator extends SimpleIndicator<STCandlestick> {

    private ma: IMovingAverageStrategy;
    private extsettings: STSettings = new STSettings();

    constructor (source: IDataSource<Candlestick>, context: IContext) {
        super(STCandlestick, source, context);
        this.name = 'ST';

        this.ma = MovingAverageFactory.instance.create(MovingAverageType.ADX);

        // Adding TR to build ATR
        this.source.addExtension(TrueRangeExtension.uname, new TrueRangeExtension());

        // Set default settings
        this.settings.period = 10;
    }

    protected computeOne(sourceItems: FixedSizeArray<Candlestick>,
                         computedArray: FixedSizeArray<STCandlestick>, accessor: IValueAccessor): STCandlestick {

        const N = this.settings.period;
        const multiplier = this.extsettings.multiplier;

        const current = sourceItems.last();
        const prev = sourceItems.length > 1 ? sourceItems.getItem(sourceItems.length - 1) : undefined;
        const lastComputed = computedArray.lastOrDefault();

        const computed = new STCandlestick(current.date);
        computed.uidOrig.t = current.uid.t;
        computed.uidOrig.n = current.uid.n;

        // Build ATR
        const lastComputedValue = lastComputed !== undefined ? lastComputed.ATR : undefined;
        computed.ATR = this.ma.compute(N, sourceItems, c => c.ext['tr'], undefined, lastComputedValue);

        if (current.c !== undefined && current.h !== undefined && current.l !== undefined && computed.ATR !== undefined) {

            // Defining current trend
            //
            computed.trend = Type.Up; // default trend
            if (lastComputed !== undefined && lastComputed.c !== undefined) {
                if (lastComputed.trend === Type.Up && current.c < lastComputed.c) {
                    computed.trend = Type.Down;
                } else if (lastComputed.trend === Type.Down && current.c > lastComputed.c) {
                    computed.trend = Type.Up;
                } else if (lastComputed.trend !== Type.Undef) {
                    computed.trend = lastComputed.trend;
                }
            }

            // Computing up/down trend values
            const hl2 = (current.h + current.l) / 2;
            const up = hl2 - multiplier * computed.ATR;
            const down = hl2 + multiplier * computed.ATR;

            //computed.trendUp = ( prev.c > lastComputed.trendUp ) ? Math.max(up, lastComputed.trendUp) : up;
            computed.trendUp = up;

            //computed.trendDown = ( sourceprev.c < lastComputed.trendDown ) ? Math.min(down, lastComputed.trendDown) : down;
            computed.trendDown = down;

            if (prev !== undefined && prev.c !== undefined && lastComputed !== undefined && lastComputed.trendUp !== undefined
                && prev.c > lastComputed.trendUp) {
                computed.trendUp = Math.max(up, lastComputed.trendUp);
            }
            if (prev !== undefined && prev.c !== undefined && lastComputed !== undefined && lastComputed.trendDown !== undefined
                && prev.c < lastComputed.trendDown) {
                computed.trendDown = Math.min(down, lastComputed.trendDown);
            }

            // Computing supertrend
            //
            if (computed.trend === Type.Up) {
                computed.c = computed.trendUp;
            } else if (computed.trend === Type.Down) {
                computed.c = computed.trendDown;
            }

            computed.h = computed.c;
            computed.l = computed.c;
        }

        return computed;
    }

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('period', new SettingSet({
            name: 'period',
            value: this.settings.period.toString(),
            settingType: SettingType.numeric,
            displayName: 'Period'
        }));

        group.setSetting('multiplier', new SettingSet({
            name: 'multiplier',
            value: this.extsettings.multiplier.toString(),
            settingType: SettingType.numeric,
            displayName: 'Factor'
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const period = value.getSetting('datasource.period');
        this.settings.period = (period && period.value) ? parseInt(period.value, 10) : this.settings.period;

        const multiplier = value.getSetting('datasource.multiplier');
        this.extsettings.multiplier = (multiplier && multiplier.value) ? parseFloat(multiplier.value) : this.extsettings.multiplier;

        // recompute
        this.compute();
    }
}

class STSettings {
    public multiplier: number = 3;
}

export class STIndicatorRenderer implements IChartRender<Candlestick> {

    public render(canvas: ICanvas,
                  data: IDataIterator<Candlestick>,
                  frame: IRect,
                  timeAxis: ITimeAxis,
                  yAxis: IAxis<number>): void {

        let found = false;
        let curPoint: IPoint|undefined = undefined;
        let prevPoint: IPoint|undefined = undefined;
        let curItem: STCandlestick|undefined = undefined;
        let prevItem: STCandlestick|undefined = undefined;

        RenderUtils.iterate(timeAxis, data, (item, x) => {

            curItem = (item instanceof STCandlestick) ? <STCandlestick>item : undefined;

            let cur = undefined;
            if (curItem) {
                const st = <STCandlestick>curItem;
                if (st && st.c !== undefined) {
                    cur = { uid: curItem.uid, v: st.c };

                    const y = yAxis.toX(cur.v);
                    curPoint = { x: x, y: y };

                    if (prevItem) {
                        if (curItem.trend === Type.Up && prevItem.trend === Type.Up) {
                            canvas.setStrokeStyle('#56B50E');
                        } else if (curItem.trend === Type.Down && prevItem.trend === Type.Down) {
                            canvas.setStrokeStyle('#FF0000');
                        } else {
                            canvas.setStrokeStyle('#606060');
                        }
                    }

                    if (prevPoint) {
                        canvas.beginPath();
                        canvas.moveTo(prevPoint.x, prevPoint.y);
                        canvas.lineTo(curPoint.x, curPoint.y);
                        canvas.stroke();
                    }

                    prevItem = curItem;
                    prevPoint = curPoint;
                }
            }
        });
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
