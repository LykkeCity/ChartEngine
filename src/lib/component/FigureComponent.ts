/**
 * Figures
 */
import { VisualComponent } from '../core/index';
import { IStateController } from './Interfaces';

export abstract class FigureComponent extends VisualComponent {

    protected isHovered = false;
    protected isSelected = false;

    public abstract getEditState(): IStateController;

    public setHovered(hovered: boolean): void {
        this.isHovered = hovered;
        for (const vc of this._children) {
            if (vc instanceof FigureComponent) {
                vc.setHovered(hovered);
            }
        }
    }

    public setSelected(selected: boolean): void {
        this.isSelected = selected;
        for (const vc of this._children) {
            if (vc instanceof FigureComponent) {
                vc.setSelected(selected);
            }
        }
    }
}
