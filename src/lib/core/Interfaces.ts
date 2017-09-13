/**
 * Core interfaces.
 */
import { Candlestick, Uid } from '../model/index';
import { FixedSizeArray, IPoint, IRange, Iterator } from '../shared/index';
import { TimeInterval } from './Enums';
import { SettingSet } from './SettingSet';

export class TimeBar {
    public uid: Uid;
    public x: number;
}

export class Grid<T> {
    public bars: T[] = [];
    public precision: number = 0;
}

export interface IChartPoint {
    readonly uid?: Uid;
    readonly v?: number;
}

export interface ITimeCoordConverter {
    toX(uid: Uid): number|undefined;
    toValue(x: number): Uid|undefined;
    dist(uidFrom: Uid, uidTo: Uid): number|undefined;
    add(uid: Uid, amount: number): Uid|undefined;
}

export interface IValueCoordConverter<T> {
    toX(value: number): number;
    toValue(x: number): T | undefined;
}

export interface ITimeAxis extends ITimeCoordConverter {
    range: IRange<Uid>;
    interval: number;
    count: number;
    reset(): void;
    moveNext(): boolean;
    current: TimeBar;
    move(direction: number): void;
    scale(direction: number): void;
    lock(uid: Uid): void;
    /**
     * For rendering grid
     */
    getGrid(): Iterator<TimeBar>;

    /**
     * Returns amount of data intervals b/w specified uids.
     */
    dist(uidFrom: Uid, uidTo: Uid): number|undefined;

    /**
     * Adds specified amount of intervals to the specified uid.
     */
    add(uid: Uid, amount: number): Uid|undefined;
}

export interface IAxis<T> extends IValueCoordConverter<T> {
    range: IRange<T>;
    interval: number;
    getGrid(): Grid<T>;
    getValuesRange(fromX: number, toX: number): IRange<T | undefined>;
    move(direction: number): void;
    scale(direction: number): void;
}

export interface ICoordsConverter {
    toX(value: Uid): number|undefined;
    xToValue(x: number): Uid|undefined;

    toXY(point: IChartPoint): IPoint|undefined;
    xyToValue(point: IPoint): IChartPoint;

    toY(value: number): number;
    yToValue(y: number): number|undefined;
}

export interface ISource {
    getHHLL(uidFrom: Uid, uidTo: Uid): Candlestick|undefined;
    getLastCandle(): Candlestick|undefined;
}

export interface IMouse {
    pos: IPoint;
    isDown: boolean;
    isEntered: boolean;
}

export interface ITouch {
    isFirst: boolean;
    isFinal: boolean;
    distance: number;
    deltaX: number;
    deltaY: number;
    center: IPoint;
}

export interface IDataService {
    getCandle: (asset: string, date: Date, interval: TimeInterval) => Promise<Candlestick>;
}

export interface IStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}

export interface IIndicatorExtension {
    amountRequires: number;
    extend(line: FixedSizeArray<Candlestick>): void;
}

export interface IQuicktipBuilder {
    addQuicktip(uid: string): IQuicktip;
    removeQuicktip(uid: string): void;
}

export interface IQuicktip {
    addTextBlock(uid: string, text: string): void;
    removeTextBlock(uid: string): void;
    addButton(uid: string, click: () => void): void;
}

export interface IConfigurable {
    getSettings(): SettingSet;
    setSettings(settings: SettingSet): void;
}

export function isConfigurable(obj: any): obj is IConfigurable {
    return (<IConfigurable>obj).setSettings !== undefined;
}

export interface IStateful {
    getState(): string;
    restore(state: string): void;
}

export function isStateful(obj: any): obj is IStateful {
    return (<IStateful>obj).getState !== undefined;
}

export type Action = () => void;

export interface ICommand {
    execute(): ICommand;
    undo(): void;
}
