/**
 * Prevent ghost click function.
 * Source: https://gist.github.com/jtangelder/361052976f044200ea17
 */
const threshold = 25;
const timeout = 2500;

export interface IGhostClickSuppressor {
    destroy(): void;
}

class GhostClickSuppressor {

    private coordinates: any[] = [];
    private el?: HTMLElement;

    constructor(el: HTMLElement) {
        if ('ontouchstart' in window) { // if touch support
            this.el = el;
            this.el.addEventListener('touchstart', this.resetCoordinates, true);
            this.el.addEventListener('touchend', this.registerCoordinates, true);
            this.el.addEventListener('click', this.preventGhostClick, true);
        }
    }

    public destroy() {
        if (this.el) {
            this.el.removeEventListener('touchstart', this.resetCoordinates, true);
            this.el.removeEventListener('touchend', this.registerCoordinates, true);
            this.el.removeEventListener('click', this.preventGhostClick, true);
            this.el = undefined;
        }
    }

    /**
     * prevent clicks if they're in a registered XY region
     * @param {MouseEvent} ev
     */
    private preventGhostClick = (ev: any) => {
        for (const item of this.coordinates) {
            const x = item[0];
            const y = item[1];

            // within the range, so prevent the click
            if (Math.abs(ev.clientX - x) < threshold && Math.abs(ev.clientY - y) < threshold) {
                ev.stopPropagation();
                ev.preventDefault();
                break;
            }
        }
    }

    /**
     * if it is an final touchend, we want to register it's place
     * @param {TouchEvent} ev
     */
    private registerCoordinates = (ev: any) => {
        // touchend is triggered on every releasing finger
        // changed touches always contain the removed touches on a touchend
        // the touches object might contain these also at some browsers (firefox os)
        // so touches - changedTouches will be 0 or lower, like -1, on the final touchend
        if (ev.touches.length - ev.changedTouches.length <= 0) {
            const touch = ev.changedTouches[0];
            this.coordinates.push([touch.clientX, touch.clientY]);

            setTimeout(this.popCoordinates, timeout);
        }
    }

    /**
     * reset the coordinates array
     */
    private resetCoordinates = () => {
        //coordinates = [];
        this.coordinates.length = 0;
    }

    /**
     * remove the first coordinates set from the array
     */
    private popCoordinates = () => {
        this.coordinates.splice(0, 1);
    }
}

export class TouchUtils {
    public static PREVENT_GHOST_CLICK(el: HTMLElement): IGhostClickSuppressor {
        return new GhostClickSuppressor(el);
    }
}
