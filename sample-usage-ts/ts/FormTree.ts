/**
 * 
 */
import * as lychart from '../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import IEvent = lychart.shared.IEvent;
import Event = lychart.shared.Event;
import VisualComponent = lychart.core.VisualComponent;

export class ItemSelectedArg {
    constructor(
        public readonly uid: string,
        public readonly object: any
    ) {
    }
}

export class ItemSelectedEvent extends Event<ItemSelectedArg> {
}

export class FormTree {
    private container: HTMLElement;
    private board: ChartBoard;
    protected readonly itemSelectedEvent = new ItemSelectedEvent();

    constructor(container: HTMLElement, board: ChartBoard) {
        //this.container = parent.getElementsByClassName('tree')[0];
        // this.container = document.createElement('div');
        // parent.appendChild(this.container);

        this.board = board;
        this.container = container;
    }

    public get itemSelected(): IEvent<ItemSelectedArg> {
        return this.itemSelectedEvent;
    }

    public hide(): void {
        this.container.style.setProperty('display', 'none');
    }

    public show(): void {
        this.container.style.removeProperty('display');
    }

    public update() {
        this.container.innerText = '';

        this.board.stacks.forEach(stack => {
            this.appendItem(this.container, stack.uid, 'Chart', 0);
            stack.charts.forEach(chart => {
                this.appendItem(this.container, chart.uid, chart.name, 10);
            });
        });
    }

    private getObjectById(uid: string): any|undefined {
        for (const stack of this.board.stacks) {
            if (stack.uid === uid) {
                return stack;
            }
            for (const chart of stack.charts) {
                if (chart.uid === uid) {
                    return chart;
                }
            }
        }
    }

    private appendItem(htmlEl: HTMLElement, uid: string, name: string, margin: number) {
        const item = document.createElement('div');
        item.style.setProperty('margin-left', margin + 'px');
        item.classList.add('treeitem');

        const caption = document.createElement('div');
        caption.innerText = name;
        caption.setAttribute('data-uid', uid);

        caption.onclick = this.onItemSelected;

        item.appendChild(caption);
        htmlEl.appendChild(item);
    }

    private buildList(htmlEl: HTMLElement, components: VisualComponent[], margin: number) {
        for (const component of components) {

            // <div style='margin-left: ;'>
            //    <div>
            //        Caption
            //    </div>
            // </div>

            const item = document.createElement('div');
            item.style.setProperty('margin-left', margin + 'px');
            const caption = document.createElement('div');
            caption.innerText = 'caption';
            caption.setAttribute('data-uid', '00001');

            caption.onclick = this.onItemSelected;

            item.appendChild(caption);
            htmlEl.appendChild(item);

            this.buildList(item, component.children, margin + 10);
        }
    }

    private onItemSelected = (ev: MouseEvent): any => {
        const uid = ev.srcElement ? ev.srcElement.getAttribute('data-uid') : undefined;
        if (uid) {
            const obj = this.getObjectById(uid);
            if (obj) {
                this.itemSelectedEvent.trigger(new ItemSelectedArg(uid, obj));
            } else {
                console.error('Object is not found, uid = ' + uid);
            }
        }
    }
}
