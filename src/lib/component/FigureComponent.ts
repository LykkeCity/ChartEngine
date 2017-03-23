/**
 * Figures
 */
import { VisualComponent } from '../core/index';
import { IStateController } from './Interfaces';

export abstract class FigureComponent extends VisualComponent {
    public abstract getEditState(): IStateController;
}

