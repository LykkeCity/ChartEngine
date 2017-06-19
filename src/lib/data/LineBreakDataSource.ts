/**
 * LineBreakDataSource class.
 */
import { AvgTrueRangeExtension } from '../compute/index';
import { SettingSet, SettingType } from '../core/index';
import { Candlestick } from '../model/index';
import { IRange } from '../shared/index';
import { ComputedDataSource } from './ComputedDataSource';
import { DataChangedArgument } from './DataChangedEvent';
import { IDataSource } from './Interfaces';

export class LineBreakDataSource extends ComputedDataSource<Candlestick> {
    constructor(source: IDataSource<Candlestick>, timeRange: IRange<Date>) {
        super(source);

        this.timeRange = timeRange;

        // Compute initial data set
        this.compute();
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {

        const computedData: Candlestick[] = [];

        if (arg) {

            // Keep all uid that less than arg, and remove all that 
            const time = arg.uidFirst.t.getTime();
            this.dataStorage.removeAfterInclusive(c => c.uid.t.getTime() >= time);

            // Find 2 or 3 last computed item.
            const iter = this.dataStorage.getIterator();
            if (iter.goToLast()) {
                computedData.push(iter.current);
                if (iter.movePrev()) {
                    computedData.push(iter.current);
                }
                if (this.settings.breakType === BreakType.LineBreak3 && iter.movePrev()) {
                    computedData.push(iter.current);
                }
                // invert array
                computedData.reverse();
            }

            const res = this.sourceIterator.goTo(item => item.uid.compare(arg.uidFirst) === 0);
            if (!res) {
                return;
            }

        } else {
            // Remove everything and recompute

            this.dataStorage.clear();

            const res = this.sourceIterator.goTo(item => true); // go to first element
            if (!res) {
                return;
            }
        }

        do {
            this.computeOne(computedData, this.sourceIterator.current);
        } while (this.sourceIterator.moveNext());

        // Merge new data and notify subscribers
        if (computedData.length > 0) {

            this.dataStorage.merge(computedData);

            return new DataChangedArgument(
                computedData[0].uid,
                computedData[computedData.length - 1].uid,
                computedData.length);
        }
    }

    private computeOne(computedArray: Candlestick[], source: Candlestick) {

        const last = computedArray.length > 0 ? computedArray[computedArray.length - 1] : undefined;

        // TODO: replace with "isEmpty" function:
        if (!source.o || !source.c || !source.h || !source.l) {
            return;
        }

        let computed;
        if (last === undefined) {
            // Generate first item, just copying first candlestick
            computed = new Candlestick(source.date, source.c, source.o, source.h, source.l);
            computedArray.push(computed);
        } else {

            if (!last.c || !last.o) {
                throw new Error('Value of computed candle is undefined.');
            }

            const lastSign = last.c - last.o; // -1 down / +1 up / 0 can go both way
            const reverseValues = this.computeReverseValue(computedArray, this.settings.breakType === BreakType.LineBreak2 ? 2 : 3);

            if ((lastSign >= 0 && ( source.c > last.c || source.c < reverseValues.start ))
                || (lastSign <= 0 && ( source.c < last.c || source.c > reverseValues.end ))) {
                computed = new Candlestick(source.date, source.c, last.c, Math.max(last.c, source.c), Math.min(last.c, source.c));
                computedArray.push(computed);
            }
        }
    }

    private computeReverseValue(lines: Candlestick[], count: number): IRange<number> {
        if (lines.length === 0) {
            throw new Error('Array is empty.');
        }
        let min = Number.MAX_VALUE;
        let max = Number.MIN_VALUE;
        for (let i = lines.length - 1; i >= lines.length - count && i >= 0; i -= 1) {
            const c = <number>lines[i].c;
            const o = <number>lines[i].o;
            if (c > max) { max = c; }
            if (o > max) { max = o; }
            if (c < min) { min = c; }
            if (o < min) { min = o; }
        }
        return { start: min, end: max };
    }

    private settings: LineBreakSettings = new LineBreakSettings();

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('breakType', new SettingSet({
            name: 'breakType',
            displayName: 'Box',
            value: this.settings.breakType.toString(),
            settingType: SettingType.select,
            options: [
                { value: BreakType.LineBreak2.toString(), text: '2-Line Break' },
                { value: BreakType.LineBreak3.toString(), text: '3-Line Break' }
            ]
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const breakType = value.getSetting('datasource.breakType');
        this.settings.breakType = (breakType && breakType.value) ? parseInt(breakType.value, 10) : this.settings.breakType;

        // recompute
        this.compute();
    }
}

enum BreakType {
    LineBreak2 = 2,
    LineBreak3 = 3
}

class LineBreakSettings {
    public breakType: BreakType = BreakType.LineBreak2;
}
