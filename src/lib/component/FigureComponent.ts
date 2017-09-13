/**
 * Class FigureComponent
 */
import { StoreContainer, VisualComponent } from '../core/index';
import { IPoint, ISize, Point } from '../shared/index';
import { UidUtils } from '../utils/index';
import { IStateController } from './Interfaces';

export abstract class FigureComponent extends VisualComponent {

    protected isHovered = false;
    protected isSelected = false;

    public constructor(name: string, offset: IPoint, size: ISize, container: StoreContainer) {
        super(offset, size, (container && container.getProperty('uid')) ? container.getProperty('uid') : UidUtils.NEWUID(), name);

        container.setProperty('uid', this._uid);
    }

    public abstract getEditState(): IStateController;

    public setHovered(hovered: boolean): void {
        this.isHovered = hovered;
        for (const vc of this._children) {
            if (vc instanceof FigureComponent) {
                vc.setHovered(hovered);
            }
        }
    }

    public getSelected(): boolean {
        return this.isSelected;
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
