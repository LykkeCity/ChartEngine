/**
 * 
 */
import { ICanvas, LinePattern } from '../canvas/index';
import { IAxis, ITimeAxis, SettingSet, SettingType, TimeInterval } from '../core/index';
import { IPoint } from '../shared/index';

export class ChartRenderer {

    protected settings = new RenderSettings();

    protected getZonesSettings(): SettingSet {

        const toplineGroup = new SettingSet({ name: 'topline', group: true, displayName: 'Top line' });

        toplineGroup.setSetting('color', new SettingSet({
            name: 'color',
            value: this.settings.zone.tlinecolor.toString(),
            settingType: SettingType.color,
            displayName: ''
        }));

        toplineGroup.setSetting('pattern', new SettingSet({
            name: 'pattern',
            value: this.settings.zone.tlinepattern.toString(),
            displayName: '',
            settingType: SettingType.select,
            options: [
                { value: LinePattern.Solid.toString(), text: 'solid' },
                { value: LinePattern.Dashed.toString(), text: 'dashed' },
                { value: LinePattern.Pointed.toString(), text: 'pointed' }
            ]
        }));

        toplineGroup.setSetting('width', new SettingSet({
            name: 'width',
            value: this.settings.zone.tlinewidth.toString(),
            settingType: SettingType.numeric,
            displayName: ''
        }));

        const bottomGroup = new SettingSet({ name: 'bottomline', group: true, displayName: 'Bottom line' });

        bottomGroup.setSetting('color', new SettingSet({
            name: 'color',
            value: this.settings.zone.blinecolor.toString(),
            settingType: SettingType.color,
            displayName: ''
        }));

        bottomGroup.setSetting('pattern', new SettingSet({
            name: 'pattern',
            value: this.settings.zone.blinepattern.toString(),
            displayName: '',
            settingType: SettingType.select,
            options: [
                { value: LinePattern.Solid.toString(), text: 'solid' },
                { value: LinePattern.Dashed.toString(), text: 'dashed' },
                { value: LinePattern.Pointed.toString(), text: 'pointed' }
            ]
        }));

        bottomGroup.setSetting('width', new SettingSet({
            name: 'width',
            value: this.settings.zone.blinewidth.toString(),
            settingType: SettingType.numeric,
            displayName: ''
        }));

        const fillGroup = new SettingSet({ name: 'fill', group: true, displayName: 'Fill color' });

        fillGroup.setSetting('filled', new SettingSet({
            name: 'filled',
            value: this.settings.zone.fill.toString(),
            settingType: SettingType.check,
            displayName: ''
        }));

        fillGroup.setSetting('color', new SettingSet({
            name: 'color',
            value: this.settings.zone.fillcolor.toString(),
            settingType: SettingType.color,
            displayName: ''
        }));

        const fillOverlapGroup = new SettingSet({ name: 'filloverlap', group: true, displayName: 'Fill colors' });

        fillOverlapGroup.setSetting('fill', new SettingSet({
            name: 'fill',
            value: this.settings.zone.overlapfill.toString(),
            settingType: SettingType.check,
            displayName: ''
        }));

        fillOverlapGroup.setSetting('colorup', new SettingSet({
            name: 'colorup',
            value: this.settings.zone.overlapcolorUp.toString(),
            settingType: SettingType.color,
            displayName: ''
        }));

        fillOverlapGroup.setSetting('colordown', new SettingSet({
            name: 'colordown',
            value: this.settings.zone.overlapcolorDown.toString(),
            settingType: SettingType.color,
            displayName: ''
        }));

        const group = new SettingSet({ name: 'zones', group: true, displayName: 'Zones' });

        group.setSetting('visible', new SettingSet({
            name: 'visible',
            value: this.settings.zone.visible.toString(),
            settingType: SettingType.check,
            displayName: 'Visible'
        }));

        group.setSetting('upthreshold', new SettingSet({
            name: 'upthreshold',
            value: this.settings.zone.upthreshold.toString(),
            settingType: SettingType.numeric,
            displayName: 'Upper threshold'
        }));

        group.setSetting('lowthreshold', new SettingSet({
            name: 'lowthreshold',
            value: this.settings.zone.lowthreshold.toString(),
            settingType: SettingType.numeric,
            displayName: 'Lower threshold'
        }));

        group.setSetting('pricevalues', new SettingSet({
            name: 'pricevalues',
            value: this.settings.zone.pricevalues.toString(),
            settingType: SettingType.check,
            displayName: 'Values on price scale'
        }));

        group.setSetting('showthreshold', new SettingSet({
            name: 'showthreshold',
            value: this.settings.zone.showthreshold.toString(),
            settingType: SettingType.check,
            displayName: 'Show threshold lines'
        }));

        group.setSetting('topline', toplineGroup);
        group.setSetting('bottomline', bottomGroup);
        group.setSetting('fill', fillGroup);
        group.setSetting('filloverlap', fillOverlapGroup);

        return group;
    }

    protected setZonesSettings(value: SettingSet) {
        let st: SettingSet|undefined;

        st = value.getSetting('zones.visible');
        this.settings.zone.visible = (st && st.value) ? st.value === 'true' : this.settings.zone.visible;

        // showthreshold
        st = value.getSetting('zones.showthreshold');
        this.settings.zone.showthreshold = (st && st.value) ? st.value === 'true' : this.settings.zone.showthreshold;

        // upthreshold
        st = value.getSetting('zones.upthreshold');
        this.settings.zone.upthreshold = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.upthreshold;

        // lowthreshold
        st = value.getSetting('zones.lowthreshold');
        this.settings.zone.lowthreshold = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.lowthreshold;

        // pricevalues
        st = value.getSetting('zones.pricevalues');
        this.settings.zone.pricevalues = (st && st.value) ? st.value === 'true' : this.settings.zone.pricevalues;

        // topline (color, pattern, width)
        const topline = value.getSetting('zones.topline');
        if (topline) {
            st = topline.getSetting('topline.color');
            this.settings.zone.tlinecolor = (st && st.value) ? st.value : this.settings.zone.tlinecolor;

            st = topline.getSetting('topline.pattern');
            this.settings.zone.tlinepattern = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.tlinepattern;

            st = topline.getSetting('topline.width');
            this.settings.zone.tlinewidth = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.tlinewidth;
        }

        // bottomline (color, pattern, width)
        const bottomline = value.getSetting('zones.bottomline');
        if (bottomline) {
            st = bottomline.getSetting('bottomline.color');
            this.settings.zone.blinecolor = (st && st.value) ? st.value : this.settings.zone.blinecolor;

            st = bottomline.getSetting('bottomline.pattern');
            this.settings.zone.blinepattern = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.blinepattern;

            st = bottomline.getSetting('bottomline.width');
            this.settings.zone.blinewidth = (st && st.value) ? parseInt(st.value, 10) : this.settings.zone.blinewidth;
        }

        // fill (fill, color)
        const fill = value.getSetting('zones.fill');
        if (fill) {
            st = fill.getSetting('fill.color');
            this.settings.zone.fillcolor = (st && st.value) ? st.value : this.settings.zone.fillcolor;

            st = fill.getSetting('fill.filled');
            this.settings.zone.fill = (st && st.value) ? st.value === 'true' : this.settings.zone.fill;
        }

        // filloverlap (fill, colorup, colordown)
        const ovrlap = value.getSetting('zones.filloverlap');
        if (ovrlap) {
            st = ovrlap.getSetting('filloverlap.fill');
            this.settings.zone.overlapfill = (st && st.value) ? st.value === 'true' : this.settings.zone.overlapfill;

            st = ovrlap.getSetting('filloverlap.colorup');
            this.settings.zone.overlapcolorUp = (st && st.value) ? st.value : this.settings.zone.overlapcolorUp;

            st = ovrlap.getSetting('filloverlap.colordown');
            this.settings.zone.overlapcolorDown = (st && st.value) ? st.value : this.settings.zone.overlapcolorDown;
        }
    }
}

export class RenderSettings {
    public zone = new ZoneSettings();
}

export class ZoneSettings {
    public visible = true;
    public showthreshold = true;
    public upthreshold = 80;
    public lowthreshold = 20;
    public pricevalues = false;

    // Top line
    public tlinecolor = '#555555';
    public tlinepattern = LinePattern.Solid;
    public tlinewidth = 1;

    // Bottom line
    public blinecolor = '#555555';
    public blinepattern = LinePattern.Solid;
    public blinewidth = 1;

    // Fill
    public fill = false;
    public fillcolor = '#777777';

    // Overlap
    public overlapfill = false;
    public overlapcolorUp = '#3AA000';
    public overlapcolorDown = '#CE0000';
}
