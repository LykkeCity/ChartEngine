/**
 * VisualContext class.
 */
import { Point } from '../shared/index';

export class VisualContext {
    private _renderBase: boolean;
    private _renderFront: boolean;

    public get renderBase(): boolean {
        return this._renderBase;
    }

    public get renderFront(): boolean {
        return this._renderFront;
    }

    constructor(
        renderBase: boolean,
        renderFront: boolean
        ) {
            this._renderBase = renderBase;
            this._renderFront = renderFront;
    }
}
