/**
 * TreeViewModel class. View model of a specific chart.
 */
import * as lychart from '../../../src/lychart';
import ChartBoard = lychart.ChartBoard;
import IEvent = lychart.shared.IEvent;
import Event = lychart.shared.Event;

export class ItemSelectedArg {
    constructor(
        public readonly uid: string,
        public readonly object: any
    ) {
    }
}

export class ItemSelectedEvent extends Event<ItemSelectedArg> {
}

export class TreeViewModel {
    public readonly itemSelected = new ItemSelectedEvent();

    public stacks = ko.observableArray();

    constructor(
        private board: ChartBoard) {

        this.rebuild();
    }

    public cmdSelectChart(chart: any) {
        if (chart && chart.uid) {
            this.selectObjectByUid(chart.uid);
        }
    }

    public cmdSelectFigure(figure: any) {
        if (figure && figure.uid) {
            this.selectObjectByUid(figure.uid);
        }
    }

    private selectObjectByUid(uid: string) {
        if (uid) {
            const obj = this.board.getObjectById(uid);
            if (obj) {
                this.itemSelected.trigger(new ItemSelectedArg(uid, obj));
            } else {
                console.error('Object is not found, uid = ' + uid);
            }
        }
    }

    public update() {
        this.rebuild();

        $('[data-role="collapsible"]').trigger('create');
    }

    private rebuild() {
        this.stacks.removeAll();

        const self = this;
        this.board.stacks.forEach(stack => {

            const charts = stack.charts.map(s => {
                return { uid: s.uid, name: s.name };
            });

            const figures = stack.figures.map(f => {
                return { uid: f.uid, name: f.name };
            });

            self.stacks.push({
                uid: stack.uid,
                name: 'Chart',
                charts: charts,
                figures: figures
            });
        });
    }
}
