/**
 * FigureEditStateBase class.
 */
import { IChartBoard, IChartStack, IStateController } from '../component/index';
import { IMouse, ITouch } from '../core/index';
import { IHashTable, Point } from '../shared/index';

export abstract class FigureEditStateBase implements IStateController {

    protected lastMouse = new Point();
    protected lastTouch?: Point;
    protected stack?: IChartStack;

    public onMouseWheel(board: IChartBoard, mouse: IMouse): void { }
    public onMouseEnter(board: IChartBoard, mouse: IMouse): void { }
    public onMouseLeave(board: IChartBoard, mouse: IMouse): void { }
    public onMouseUp(board: IChartBoard, mouse: IMouse): void {
        this.exit(board);
    }
    public onMouseDown(board: IChartBoard, mouse: IMouse): void { }

    public onMouseMove(board: IChartBoard, mouse: IMouse): void {
        if (this.stack) {
            // Change mouse x/y only if line was shifted. Ignoring "empty" movement.
            const shifted = this.shift(mouse.pos.x - this.lastMouse.x, mouse.pos.y - this.lastMouse.y);
            if (shifted) {
                [this.lastMouse.x, this.lastMouse.y] = [mouse.pos.x, mouse.pos.y];
            }
        } else {
            [this.lastMouse.x, this.lastMouse.y] = [mouse.pos.x, mouse.pos.y];
        }
    }

    public onTouchPan(board: IChartBoard, touch: ITouch): void {
        if (this.lastTouch) {
            const dx = touch.center.x - this.lastTouch.x;
            const dy = touch.center.y - this.lastTouch.y;
            console.log(`shifting ${dx} ${dy}`);
            const shifted = this.shift(dx, dy);
            if (shifted) {
                [this.lastTouch.x, this.lastTouch.y] = [touch.center.x, touch.center.y];
            }
        } else {
            this.lastTouch = new Point(touch.center.x, touch.center.y);
        }

        if (touch.isFinal) {
            this.exit(board);
        }
    }

    public onTouchPress(board: IChartBoard, touch: ITouch): void { }
    public onTouchSwipe(board: IChartBoard, touch: ITouch): void { }
    public onTouchTap(board: IChartBoard, touch: ITouch): void { }

    public activate(board: IChartBoard, mouse: IMouse, stack?: IChartStack, activationParameters?: IHashTable<any>): void {
        [this.lastMouse.x, this.lastMouse.y] = [mouse.pos.x, mouse.pos.y];
        this.lastTouch = undefined;

        this.stack = stack;
    }

    public deactivate(board: IChartBoard, mouse: IMouse): void { }

    protected abstract shift(dx: number, dy: number): boolean;

    protected exit(board: IChartBoard): void {
        this.stack = undefined;
        board.changeState('hover');
    }
}
