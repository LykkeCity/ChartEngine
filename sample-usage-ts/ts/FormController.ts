/**
 * 
 */
import { FormProps } from './FormProps';
import { FormTree } from './FormTree';

export class FormController {
    private container: HTMLElement;
    private tree: FormTree;
    private props: FormProps;

    constructor(container: HTMLElement) {
        this.container = container;
        // this.tree = new FormTree(this.container);
        // this.props = new FormProps(this.container);
    }


}
