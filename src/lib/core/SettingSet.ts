/**
 * 
 */
import { IHashTable } from '../shared/index';
import { DateUtils } from '../utils/index';

export class SettingType {
    public static readonly check: string = 'check';
    public static readonly color: string = 'color';
    public static readonly numeric: string = 'numeric';
    public static readonly select: string = 'select';
    public static readonly date: string = 'date';
}

export interface IOption {
    value: string;
    text: string;
}

export interface ISetting {
    name: string;
    value?: string;
    displayName?: string;
    settingType?: string;
    visible?: boolean;
    group?: boolean;
    options?: IOption[];
    settings?: ISetting[];
}

export class SettingSet {
    public name: string = '';
    public value: string = '';
    public dispalyName: string = '';
    public settingType: string = '';
    public visible: boolean = true;
    public group: boolean = false;
    public options: IOption[] = [];
    public settings: IHashTable<SettingSet> = {};

    public constructor(param: ISetting|string) {
        if (typeof param === 'string') {
            this.name = param;
        } else {
            SettingSet.init(this, param);
        }
    }

    public setSetting(path: string, setting: SettingSet): void {
        const parts = path.split('.');
        let dest = this.settings;

        for (let i = 0; i < parts.length; i += 1) {
            const part = parts[i];

            if (i === 0 && part === this.name) {
                // Ignore root name if it points to this setting
                continue;
            }

            if (!dest[part]) {
                dest[part] = new SettingSet(part);
            }

            if (i === parts.length - 1) {
                dest[part] = setting;
            }

            dest = dest[part].settings;
        }
    }

    public getValueOrDefault<T extends boolean|number|string|Date>(path: string, defaultValue: T): T {
        const setting = this.getSetting(path);

        if (setting && !setting.settingType) {
            throw new Error(`Setting type is unspecified for setting ${setting.name}`);
        }

        if (setting && setting.settingType && setting.value) {
            switch (setting.settingType) {
                case SettingType.check:
                    return <T>(setting.value === 'true');
                case SettingType.color:
                    return <T>setting.value;
                case SettingType.numeric:
                    return <T>parseInt(setting.value, 10);
                case SettingType.select:
                    return <T>parseInt(setting.value, 10);
                case SettingType.date:
                    return <T>DateUtils.parseIsoDate(setting.value);
                default: throw new Error(`Unexpected setting type ${setting.settingType}`);
            }
        }
        return defaultValue;
    }

    public getSetting(path: string): SettingSet|undefined {
        return this.getSettingImpl(path, '', this);
    }

    private getSettingImpl(path: string, counter: string, ss: SettingSet): SettingSet | undefined {
        counter = counter ? counter + '.' + ss.name : ss.name;

        if (counter === path) {
            return ss;
        }

        for (const s of Object.keys(ss.settings)) {
            const res = this.getSettingImpl(path, counter, ss.settings[s]);
            if (res) {
                return res;
            }
        }
    }

    private static init(obj: SettingSet, values: ISetting): void {
        obj.name = values.name;
        obj.value = values.value || '';
        obj.settingType = values.settingType || '';
        obj.dispalyName = values.displayName || '';
        obj.visible = values.visible !== undefined ? values.visible : true;
        obj.group = values.group || false;
        obj.options = values.options || [];

        if (values.settings) {
            for (const s of values.settings) {
                const nested = new SettingSet(s.name);
                SettingSet.init(nested, s);
                obj.setSetting(s.name, nested);
            }
        }
    }
}
