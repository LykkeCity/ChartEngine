/**
 * 
 */
import { AvgTrueRangeExtension } from '../compute/index';
import { SettingSet, SettingType } from '../core/index';
import { Candlestick } from '../model/index';
import { IRange } from '../shared/index';
import { ComputedDataSource } from './ComputedDataSource';
import { DataChangedArgument } from './DataChangedEvent';
import { IDataSource } from './Interfaces';


export class RenkoCandle extends Candlestick {
    public visible: boolean = true;
}

export class RenkoDataSource extends ComputedDataSource<RenkoCandle> {
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
        let boxSize = this.settings.boxSize;
        if (this.settings.boxType === BoxType.ATR && this.timeRange) {
            const endTime = this.timeRange.end.getTime();
            // Find first element that is greater than time range and move back
            if (this.sourceIterator.goTo(item => item.uid.t.getTime() > endTime)
                && this.sourceIterator.movePrev()
                && this.sourceIterator.current.ext['atr']) {
                boxSize = this.sourceIterator.current.ext['atr'];
            } else if (this.sourceIterator.last
                && this.sourceIterator.last.ext['atr']) { // or get ATR last element
                boxSize = this.sourceIterator.last.ext['atr'];
            }
        }
        console.log(`ATR=${boxSize}`);

        const computedData: RenkoCandle[] = [];

        if (arg) {

            // Keep all uid that less than arg, and remove all that 
            const time = arg.uidFirst.t.getTime();
            this.dataStorage.removeAfterInclusive(c => c.uid.t.getTime() >= time);

            // Find last computed item
            //const last = this.storage.findLast(c => c.uid < first_suid);
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
            this.computeOne(computedData, this.sourceIterator.current, boxSize);
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

    private computeOne(computedArray: RenkoCandle[], source: Candlestick, box: number) {
        // ! if no close price, then ignore item
        // At least one candle should be generated, even 

        // if (source === undefined) {
        //     throw new Error('"source" argument is undefined.');
        // }
        let last = computedArray.length > 0 ? computedArray[computedArray.length - 1] : undefined;


        // TODO: replace with "isEmpty" function:
        if (!source.o || !source.c || !source.h || !source.l) {
            return;
        }

        let computed;
        // Generate first item
        if (last === undefined) {
            computed = new RenkoCandle(source.date, source.c, source.o, source.h, source.l);
            computed.visible = false;

            computedArray.push(computed);
        } else {

            if (last.c === undefined || last.h === undefined || last.o === undefined || last.l === undefined) {
                throw new Error('Value of computed candle is undefined.');
            }

            let diff = source.c - last.c;
            let change_dir = false;
            if (last.c < last.o && diff > 0) {
                change_dir = true;
            } else if (last.c > last.o && diff < 0) {
                change_dir = true;
            }

            let counter = 0;
            while ((!change_dir && Math.abs(diff) >= box) || (change_dir && Math.abs(diff) >= 2 * box)) {

                const addbox = (change_dir && counter === 0) ? 2 * box : box;

                diff = diff + (diff > 0 ? (-addbox) : addbox);

                if (last.visible === false) {
                    last.uid.t = source.uid.t;
                    last.uid.n = counter;

                    last.c = <number>last.c + (diff > 0 ? addbox : (-addbox));
                    last.o = last.c + (diff > 0 ? (-box) : box); // depends on close
                    last.h = Math.max(last.o, last.c); // depends on open, close
                    last.l = Math.min(last.o, last.c); // depends on open, close
                    last.visible = true;

                } else {
                    computed = new RenkoCandle(source.date);
                    computed.uid.t = source.uid.t;
                    computed.uid.n = counter;
                    computed.c = <number>last.c + (diff > 0 ? addbox : (-addbox));
                    computed.o = computed.c + (diff > 0 ? (-box) : box); // depends on close
                    computed.h = Math.max(computed.o, computed.c); // depends on open, close
                    computed.l = Math.min(computed.o, computed.c); // depends on open, close
                    computed.visible = true;

                    computedArray.push(computed);

                    last = computed;
                }
                counter += 1;
            }
        }
    }

    private settings: RencoSettings = new RencoSettings();

    public getSettings(): SettingSet {
        const group = new SettingSet({ name: 'datasource', group: true });

        group.setSetting('boxType', new SettingSet({
            name: 'boxType',
            displayName: 'Box',
            value: this.settings.boxType.toString(),
            settingType: SettingType.select,
            options: [
                { value: BoxType.Fixed.toString(), text: 'Fixed'},
                { value: BoxType.ATR.toString(), text: 'ATR'}
            ]
        }));

        group.setSetting('boxSize', new SettingSet({
            name: 'boxSize',
            displayName: 'Box size',
            value: this.settings.boxSize.toString(),
            settingType: SettingType.numeric,
            visible: this.settings.boxType === BoxType.Fixed
        }));

        return group;
    }

    public setSettings(value: SettingSet): void {
        const boxType = value.getSetting('datasource.boxType');
        this.settings.boxType = (boxType && boxType.value) ? parseInt(boxType.value, 10) : this.settings.boxType;

        const boxSize = value.getSetting('datasource.boxSize');
        this.settings.boxSize = (boxSize && boxSize.value) ? parseInt(boxSize.value, 10) : this.settings.boxSize;

        // recompute
        this.compute();
    }
}

enum BoxType {
    Fixed = 1,
    ATR = 2
}

class RencoSettings {
    //public period: number = 20;
    public boxType: BoxType = BoxType.Fixed;
    public boxSize = 10;
}
