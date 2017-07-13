/**
 * Figures
 */
import { IVisualComponent, VisualComponent } from '../core/index';
import { IPoint, ISize, Point } from '../shared/index';
import { UidUtils } from '../utils/index';
import { IFigure, IStateController } from './Interfaces';

export abstract class FigureComponent extends VisualComponent implements IFigure {

    protected isHovered = false;
    protected isSelected = false;
    protected readonly _uid: string;
    protected readonly _name: string;

    public constructor(name: string, offset: IPoint, size: ISize) {
        super(offset, size);
        this._uid = UidUtils.NEWUID();
        this._name = name;
    }

    public get uid(): string {
        return this._uid;
    }

    public get name(): string {
        return this._name;
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

    public setSelected(selected: boolean): void {
        this.isSelected = selected;
        for (const vc of this._children) {
            if (vc instanceof FigureComponent) {
                vc.setSelected(selected);
            }
        }
    }
}
