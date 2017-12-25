/**
 * 
 */
import { IQuicktip, IQuicktipBuilder } from '../core/index';
import { IHashTable } from '../shared/index';

export class QuicktipBuilder implements IQuicktipBuilder {
    private readonly container: HTMLElement;
    private readonly items: IHashTable<Quicktip|undefined> = {};

    constructor(container: HTMLElement) {
        this.container = container;
        this.container.classList.add('cb-quicktips');
    }

    public addQuicktip(uid: string): IQuicktip {

        const div = document.createElement('div');
        div.classList.add('cb-quicktip');
        this.container.appendChild(div);

        const qt = new Quicktip(div);
        this.items[uid] = qt;
        return qt;
    }

    public removeQuicktip(uid: string): void {
        const removedElement = this.items[uid];
        if (removedElement) {
            this.items[uid] = undefined;
            this.container.removeChild(removedElement.container);
        }
    }
}

export class Quicktip implements IQuicktip {
    private readonly _container: HTMLElement;
    constructor(container: HTMLElement) {
        this._container = container;
    }

    public get container(): HTMLElement {
        return this._container;
    }

    public addTextBlock(uid: string, text: string): void {
        const div = document.createElement('div');
        div.setAttribute('data-uid', uid);
        div.classList.add('cb-quicktip-block');
        div.innerText = text;
        this._container.appendChild(div);
    }

    public removeTextBlock(uid: string): void {
        const nodes = this.container.getElementsByTagName('div');
        for (let i = 0; i < nodes.length; i += 1) {
            const el = nodes[i];
            const attr = el.getAttribute('data-uid');
            if (attr && attr === uid) {
                this.container.removeChild(el);
                break;
            }
        }
    }

    public addButton(uid: string, click: () => void): void {
        //-----------------
    }
}
