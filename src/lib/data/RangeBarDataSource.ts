/**
 * RangeBarDataSource class
 */
import { AvgTrueRangeExtension } from '../compute/index';
import { SettingSet, SettingType } from '../core/index';
import { Candlestick } from '../model/index';
import { IRange } from '../shared/index';
import { ComputedDataSource } from './ComputedDataSource';
import { DataChangedArgument } from './DataChangedEvent';
import { IDataSource } from './Interfaces';

export class RangeBarDataSource extends ComputedDataSource<Candlestick> {
    constructor(source: IDataSource<Candlestick>, timeRange: IRange<Date>) {
        super(source);

        this.timeRange = timeRange;

        // Renco requires ATR to define optimal box size
        this.source.addExtension(AvgTrueRangeExtension.uname, new AvgTrueRangeExtension());

        // Compute initial data set
        this.compute();
    }

    protected compute(arg?: DataChangedArgument): DataChangedArgument | undefined {

        // Get ATR from last item in the time range. This will be box size.
        let range = this.settings.range;
        if (this.settings.mode === Mode.ATR && this.timeRange) {
            const endTime = this.timeRange.end.getTime();
            // Find first element that is greater than time range and move back
            if (this.sourceIterator.goTo(item => item.uid.t.getTime() > endTime)
                && this.sourceIterator.movePrev()
                && this.sourceIterator.current.ext['atr']) {
                range = this.sourceIterator.current.ext['atr'];
            } else if (this.sourceIterator.last
                && this.sourceIterator.last.ext['atr']) { // or get ATR last element
                range = this.sourceIterator.last.ext['atr'];
            }
        }
        console.log(`ATR=${range}`);

        const computedData: Candlestick[] = [];

        if (arg) {

            // Keep all uid that less than arg, and remove all that 
            const time = arg.uidFirst.t.getTime();
            this.dataStorage.removeAfterInclusive(c => c.uid.t.getTime() >= time);

            // Find last computed item
            if (this.dataStorage.last) {
                computedData.push(this.dataStorage.last);
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
            this.computeOne(computedData, this.sourceIterator.current, range);
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

    private computeOne(computedArray: Candlestick[], source: Candlestick, range: number) {

        let last = computedArray.length > 0 ? computedArray[computedArray.length - 1] : undefined;

        // TODO: replace with "isEmpty" function:
        if (!source.o || !source.c || !source.h || !source.l) {
            return;
        }

        const C = source.c;

        if (last === undefined) {
            // Build a new range
            const computed = new Candlestick(source.date);
            computed.o = source.c;
            computed.h = source.c;
            computed.l = source.c;
            // Close is undefined as the range is not built yet
            computedArray.push(computed);

        } else {
            if (last.h === undefined || last.o === undefined || last.l === undefined) {
                throw new Error('Value of computed candle is undefined.');
            }

            let counter = 0;

            //  while can build a new range
            while (last.h !== undefined && last.l !== undefined && (C < (last.h - range) || C > (last.l + range))) {

                // Close previous
                if (C < last.h - range) {
                    last.l = last.h - range;
                    last.c = last.h - range;
                } else if (C > last.l + range) {
                    last.h = last.l + range;
                    last.c = last.l + range;
                }

                // update time of previous
                last.uid.t = source.date;
                last.uid.n = counter;

                counter += 1;

                // Start new range
                const computed = new Candlestick(source.date);
                //computed.uid.n = counter;
                computed.o = last.c;
                computed.h = last.c;
                computed.l = last.c;
                computedArray.push(computed);

                last = computed;
                //counter += 1;
            }

            // Just update H / L
            last.uid.t = source.date;
            last.uid.n = counter;
            last.h = Math.max(last.h !== undefined ? last.h : -Infinity, C);
            last.l = Math.min(last.l !== undefined ? last.l : Infinity, C);
        }
    }

    private settings: RangeBarSettings = new RangeBarSettings();

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('mode', new SettingSet({
            name: 'mode',
            displayName: 'Mode',
            value: this.settings.mode.toString(),
            settingType: SettingType.select,
            options: [
                { value: Mode.Fixed.toString(), text: 'Fixed'},
                { value: Mode.ATR.toString(), text: 'ATR'}
            ]
        }));

        group.setSetting('range', new SettingSet({
            name: 'range',
            displayName: 'Range',
            value: this.settings.range.toString(),
            settingType: SettingType.numeric,
            visible: this.settings.mode === Mode.Fixed
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const mode = value.getSetting('datasource.mode');
        this.settings.mode = (mode && mode.value) ? parseInt(mode.value, 10) : this.settings.mode;

        const range = value.getSetting('datasource.range');
        this.settings.range = (range && range.value) ? parseInt(range.value, 10) : this.settings.range;

        // recompute
        this.compute();
    }
}

enum Mode {
    Fixed = 1,
    ATR = 2
}

class RangeBarSettings {
    public mode: Mode = Mode.Fixed;
    public range = 10;
}
