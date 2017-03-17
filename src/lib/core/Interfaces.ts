/**
 * Core interfaces.
 */
export interface IHoverable {
    isHit(mouseX: number, mouseY: number): boolean;
    setPopupVisibility(visible: boolean): void;
}

export function isHoverable(obj: any): obj is IHoverable {
    return (<IHoverable>obj).isHit !== undefined
     && (<IHoverable>obj).setPopupVisibility !== undefined;
}
