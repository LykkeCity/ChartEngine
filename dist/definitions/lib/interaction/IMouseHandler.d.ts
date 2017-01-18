/**
 * IMouseHandler interface.
 */
export interface IMouseHandler {
    onMouseWheel(direction: number): void;
    onMouseMove(event: any): void;
    onMouseEnter(event: any): void;
    onMouseLeave(event: any): void;
    onMouseUp(event: any): void;
    onMouseDown(event: any): void;
    onClick(event: any): void;
}
