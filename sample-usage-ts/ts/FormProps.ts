/**
 * 
 */
import * as lychart from '../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import IEvent = lychart.shared.IEvent;
import Event = lychart.shared.Event;
import SettingSet = lychart.core.SettingSet;
import SettingType = lychart.core.SettingType;
import VisualComponent = lychart.core.VisualComponent;

export class PropsEvent extends Event<undefined> {
}

export class FormProps {
    private container: HTMLElement;
    private props: HTMLElement;
    private readonly board: ChartBoard;
    private readonly obj: any;
    private readonly settingName: string;
    public readonly propsClosingEvent = new PropsEvent();
    public readonly propsAppliedEvent = new PropsEvent();

    constructor(container: HTMLElement, board: ChartBoard, uid: string, obj: any) {
        this.container = container;
        this.board = board;
        this.obj = obj;

        // clear setting controls
        $('div.props', this.container).remove();

        this.props = $('<div />')
                .addClass('props')
                .prependTo(this.container)
                .get(0);

        $('#closePropsBtn').unbind();
        $('#closePropsBtn').click(this.onCloseClick);
        $('#applyPropsBtn').unbind();
        $('#applyPropsBtn').click(this.onApplyClick);

        if (typeof obj.getSettings === 'function') {
            const settings = <SettingSet>obj.getSettings();
            this.settingName = settings.name;
            this.iterate(settings, '');
        } else {
            this.settingName = '';
        }
    }

    private iterate(ss: SettingSet, path: string) {
        path = path ? path + '.' + ss.name : ss.name;
        //console.log('Setting: path=' + path + ' name=' + ss.name + ' value=' + ss.value);
        for (const s of Object.keys(ss.settings)) {
            const setting = ss.settings[s];

            this.populateSetting(setting, path + '.' + setting.name);

            this.iterate(setting, path);
        }
    }

    public hide(): void {
        this.container.style.setProperty('display', 'none');
    }

    public show(): void {
        this.container.style.removeProperty('display');
    }

    private onCloseClick = () => {
        this.propsClosingEvent.trigger();
    }

    private onApplyClick = () => {
        if (typeof this.obj.setSettings === 'function') {
            const settings = this.collectSettings();
            this.obj.setSettings(settings);
        }
        this.propsAppliedEvent.trigger();
    }

    private populateSetting(ss: SettingSet, fullPath: string) {
        if (ss.group) {
            return;
        }

        switch (ss.settingType) {
            case SettingType.check:
                $('<span />')
                    .html(ss.dispalyName)
                    .appendTo(this.props);

                $('<input />', {
                    type : 'checkbox',
                    name: fullPath,
                    checked: ss.value === 'true',
                    value: ss.value
                })
                .addClass('prop')
                .appendTo(this.props);

                break;
            
            case SettingType.color:
                $('<span />')
                    .html(ss.dispalyName)
                    .appendTo(this.props);
                $('<input />', {
                    type : 'color',
                    name: fullPath,
                    value: ss.value
                })
                .addClass('prop')
                .appendTo(this.props);
                break;

            case SettingType.numeric:
                $('<span />')
                    .html(ss.dispalyName)
                    .appendTo(this.props);
                $('<input />', {
                    type : 'text',
                    name: fullPath,
                    value: ss.value
                })
                .addClass('prop')
                .appendTo(this.props);
                break;

            case SettingType.select:
                $('<span />')
                    .html(ss.dispalyName)
                    .appendTo(this.props);
                let sel = $('<select />', {
                    name: fullPath
//                    value: ss.value
                })
                .addClass('prop')
                .appendTo(this.props);

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

        const elements = $('.prop', this.props).get();

        for (const element of elements) {

            const attrType = element.getAttribute('type');
            const path = element.getAttribute('name');
            if (path) {
                const parts = path.split('.');
                const name = parts.length > 0 ? parts[parts.length - 1] : '';
                const ss = new SettingSet(name);

                if (attrType === 'checkbox') {
                    ss.value = (<HTMLInputElement>element).checked.toString();
                } else if (attrType === 'color') {
                    ss.value = (<HTMLInputElement>element).value;
                } else if (attrType === 'text') {
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
