/**
 * 
 */
import { Point } from '../shared';

export class VisualContext {
    public mousePosition?: Point;

    constructor(mousePosition?: Point) {
        this.mousePosition = mousePosition;
    }
}
