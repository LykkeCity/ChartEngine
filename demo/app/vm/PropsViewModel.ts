/**
 * PropsViewModel class. View model of a specific chart.
 */
import * as lychart from '../../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import IEvent = lychart.shared.IEvent;
import Event = lychart.shared.Event;
import CObject = lychart.core.CObject;
import SettingSet = lychart.core.SettingSet;
import SettingType = lychart.core.SettingType;
import VisualComponent = lychart.core.VisualComponent;

export class PropsEvent extends Event<undefined> {
}

export class PropsViewModel {
    public readonly closingEvt = new PropsEvent();
    public readonly appliedEvt = new PropsEvent();

    public title = ko.observable('');

    private obj: CObject;
    private settingName: string;

    constructor(
        private container: HTMLElement,
        private board: ChartBoard) {
    }

    public cmdApply() {
        if (this.obj) {
            const settings = this.collectSettings();
            this.board.setObjectSettings(this.obj.uid, settings);
        }
        this.appliedEvt.trigger();
    }

    public cmdCancel() {
        this.closingEvt.trigger();
    }

    public rebuild(obj: CObject): void {
        if (!obj) {
            throw new Error('Object uid is not specified');
        }
        this.obj = obj;

        // set title
        this.title(obj.name || '');

        // clear controls
        $(this.container).empty();

        const settings = this.board.getObjectSettings(obj.uid);
        if (settings) {
            this.settingName = settings.name;
            this.iterate(settings, '', this.title());
        } else {
            this.settingName = '';
        }
    }

    private iterate(ss: SettingSet, path: string, title: string) {
        path = path ? path + '.' + ss.name : ss.name;

        for (const s of Object.keys(ss.settings)) {
            const setting = ss.settings[s];

            // Set group's name
            if (setting.group && setting.dispalyName) {
                const $div = $('<h4 />')
                    .text(setting.dispalyName)
                    .addClass('subtitle')
                    .appendTo(this.container);
            }

            this.populateSetting(setting, path + '.' + setting.name);
            this.iterate(setting, path, '');
        }
    }

    private populateSetting(ss: SettingSet, fullPath: string) {
        if (ss.group) {
            return;
        }

        const $div = $('<div />')
            .addClass('field-contain')
            .appendTo(this.container);

        $('<label />')
            .text(ss.dispalyName)
            .addClass('field-title')
            .appendTo($div);

        switch (ss.settingType) {
            case SettingType.check:
                $('<input />', {
                    type : 'checkbox',
                    name: fullPath,
                    checked: ss.value === 'true',
                    value: ss.value
                })
                .addClass('field-input')
                .attr('data-type', ss.settingType)
                .appendTo($div);
                break;

            case SettingType.color:
                $('<input />', {
                    type : 'color',
                    name: fullPath,
                    value: ss.value
                })
                .addClass('field-input')
                .attr('data-type', ss.settingType)
                .appendTo($div);
                break;

            case SettingType.numeric:
                $('<input />', {
                    type : 'text',
                    name: fullPath,
                    value: ss.value
                })
                .addClass('field-input')
                .attr('data-type', ss.settingType)
                .appendTo($div);
                break;

            case SettingType.date:
                $('<input />', {
                    type : 'date',
                    name: fullPath,
                    value: ss.value
                })
                .addClass('field-input')
                .attr('data-type', ss.settingType)
                .appendTo($div);
                break;

            case SettingType.select:
                let sel = $('<select />', {
                    name: fullPath
                })
                .addClass('field-input')
                .attr('data-type', ss.settingType)
                .appendTo($div);

                ss.options.forEach(option => {
                    $('<option />', {
                        value: option.value,
                        text: option.text,
                        selected: (option.value === ss.value) ? 'selected' : false
                    })
                    .appendTo(sel);
                });
                break;
            default:
        }
    }

    private collectSettings(): SettingSet {

        const s = new SettingSet(this.settingName);
        const elements = $('.field-input', this.container).get();

        for (const element of elements) {

            const attrType = element.getAttribute('type');
            const path = element.getAttribute('name');
            if (path) {
                const parts = path.split('.');
                const name = parts.length > 0 ? parts[parts.length - 1] : '';
                const ss = new SettingSet(name);

                ss.settingType = element.getAttribute('data-type') || '';
                if (attrType === 'checkbox') {
                    ss.value = (<HTMLInputElement>element).checked.toString();
                } else if (attrType === 'color') {
                    ss.value = (<HTMLInputElement>element).value;
                } else if (attrType === 'text') {
                    ss.value = (<HTMLInputElement>element).value;
                } else if (attrType === 'date') {
                    ss.value = (<HTMLInputElement>element).value;
                } else if (element instanceof HTMLSelectElement) {
                    const options = (<HTMLSelectElement>element).options;
                    ss.value = (<HTMLOptionElement>options[options.selectedIndex]).value;
                }

                s.setSetting(path, ss);
            }
        }

        return s;
    }
}
