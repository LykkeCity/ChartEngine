/**
 * Core interfaces.
 */
import { Candlestick, Uid } from '../model/index';
import { FixedSizeArray, IRange, Iterator } from '../shared/index';
import { TimeInterval } from './Enums';
import { SettingSet } from './SettingSet';

export class TimeBar {
    public uid: Uid;
    public x: number;
}

export interface ITimeAxis {
    range: IRange<Uid>;
    interval: number;
    count: number;
    reset(): void;
    moveNext(): boolean;
    current: TimeBar;
    toX(uid: Uid): number|undefined;
    toValue(x: number): Uid|undefined;
    move(direction: number): void;
    scale(direction: number): void;
    lock(uid: Uid): void;
    /**
     * For rendering grid
     */
    getGrid(): Iterator<TimeBar>;
}

export interface IAxis<T> {
    range: IRange<T>;
    interval: number;
    toX(index: number): number;
    toValue(x: number): T | undefined;
    getGrid(): (T|undefined)[];
    getValuesRange(fromX: number, toX: number): IRange<T | undefined>;
    move(direction: number): void;
    scale(direction: number): void;
}

export interface ICoordsConverter {
    toX(value: Uid): number|undefined;
    xToValue(x: number): Uid|undefined;

    toY(value: number): number;
    yToValue(y: number): number|undefined;
}

export interface IPoint {
    readonly x: number;
    readonly y: number;
}

export interface IMouse {
    x: number;
    y: number;
    isDown: boolean;
    isEntered: boolean;
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
