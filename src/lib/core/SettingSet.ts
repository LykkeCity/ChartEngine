/**
 * 
 */
import { IHashTable } from '../shared/index';

export class SettingType {
    public static readonly check: string = 'check';
    public static readonly color: string = 'color';
    public static readonly numeric: string = 'numeric';
    public static readonly select: string = 'select';
    public static readonly date: string = 'date';
}

export interface IParameters {
    name: string;
    dispalyName?: string;
    value?: string;
    settingType?: string;
    visible?: boolean;
    group?: boolean;
    options?: IOption[];
}

export interface IOption {
    value: string;
    text: string;
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

    public constructor(param: IParameters|string) {
        if (typeof param === 'string') {
            this.name = param;
        } else {
            this.name = param.name;
            this.value = param.value || '';
            this.settingType = param.settingType || '';
            this.dispalyName = param.dispalyName || '';
            this.visible = param.visible !== undefined ? param.visible : true;
            this.group = param.group || false;
            this.options = param.options || [];
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
}
