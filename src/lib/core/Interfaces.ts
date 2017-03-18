/**
 * Core interfaces.
 */
export interface IHoverable {
    isHit(mouseX: number, mouseY: number): boolean;
    // TODO: Change name. It shows not only popups, but can also change component's view
    setPopupVisibility(visible: boolean): void;
}

export function isHoverable(obj: any): obj is IHoverable {
    return (<IHoverable>obj).isHit !== undefined
     && (<IHoverable>obj).setPopupVisibility !== undefined;
}



export class ChartPoint {
    public t?: Date;
    public v?: number;

    constructor(time?: Date, value?: number) {
        this.t = time;
        this.v = value;
    }
}
