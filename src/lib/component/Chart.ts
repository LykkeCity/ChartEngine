/**
 * Chart class.
 */
import { IAxis } from '../axes';
import { ICanvas } from '../canvas';
import { VisualComponent, VisualContext } from '../core';
import { IRenderLocator, RenderType } from '../render';
import { Point } from '../shared';

export class Chart extends VisualComponent {
    constructor(
        offset: Point,
        private canvas: ICanvas,
        public dataSource: any,
        private timeAxis: IAxis<Date>,
        private yAxis: IAxis<number>,
        private renderType: RenderType) {
            super(offset);
    }

    public render(context: VisualContext, renderLocator: IRenderLocator) {
        let renderType = '';

        if (this.renderType === RenderType.Candlestick) {
            renderType = 'candle';
        } else if (this.renderType === RenderType.Line) {
            renderType = 'line';
        } else {
            throw new Error(`Unexpected render type ${ this.renderType }`);
        }

        const render = renderLocator.getChartRender(renderType);

        const data = this.dataSource.getData(this.timeAxis.range);
        render.render(this.canvas, data, 0, 0, this.timeAxis, this.yAxis);
    }
}
