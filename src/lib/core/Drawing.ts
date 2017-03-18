/**
 * 
 */
export enum FigureType {
    Undefined = 0,
    Line = 1
}

export interface IDrawing {
    start(figure: FigureType): void;
    cancel(): void;
}
