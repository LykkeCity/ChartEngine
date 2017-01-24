/**
 * 
 */
import { Point } from '../shared/index';

export class VisualContext {
    public mousePosition?: Point;

    constructor(mousePosition?: Point) {
        this.mousePosition = mousePosition;
    }
}
