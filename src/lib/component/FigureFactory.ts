/**
 * FigureFactory class.
 */
import { FigureComponent, IChartingSettings } from '../component/index';
import { ISource, ITimeCoordConverter, IValueCoordConverter, StoreContainer } from '../core/index';
import { ChartArea } from '../layout/index';
import { IHashTable, IPoint, ISize } from '../shared/index';

export class FigureType {
    public static readonly curve = 'curve';
    public static readonly line = 'line';
    public static readonly hline = 'hline';
    public static readonly vline = 'vline';
    public static readonly rect = 'rect';
    public static readonly triangle = 'triangle';
    public static readonly path = 'path';
    public static readonly pitchfork = 'pitchfork';
    public static readonly text = 'text';
    public static readonly ellipse = 'ellipse';
    public static readonly trendchannel = 'trendchannel';
    public static readonly daterange = 'daterange';
    public static readonly fibofan = 'fibofan';
    public static readonly fibolevel = 'fibolevel';
    public static readonly fiboprojection = 'fiboprojection';
    public static readonly fibotimeprojection = 'fibotimeprojection';
    public static readonly gannfan = 'gannfan';
    public static readonly ohlcproj = 'ohlcproj';
}

export interface IFigureCreator {
    new(area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        tcoord: ITimeCoordConverter,
        vcoord: IValueCoordConverter<number>,
        container: StoreContainer,
        source?: ISource): FigureComponent;
}

export class FigureFactory {
    private static inst?: FigureFactory;
    private ctors: IHashTable<IFigureCreator> = {};

    private constructor() { }

    public static get instance(): FigureFactory {
        if (!this.inst) {
            this.inst = new FigureFactory();
        }
        return this.inst;
    }

    public register(indicatorId: string, creator: IFigureCreator) {
        this.ctors[indicatorId] = creator;
    }

    public instantiate(
        figureType: string,
        area: ChartArea,
        offset: IPoint,
        size: ISize,
        settings: IChartingSettings,
        tcoord: ITimeCoordConverter,
        vcoord: IValueCoordConverter<number>,
        container: StoreContainer,
        source?: ISource): FigureComponent {

        const ctor = this.ctors[figureType];
        if (ctor) {
            return new ctor(area, offset, size, settings, tcoord, vcoord, container, source);
        } else {
            throw new Error(`Indicator with id=${figureType} is not registered.`);
        }
    }
}
