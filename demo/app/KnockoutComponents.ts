/**
 * Custom knockout components
 */
import { AppViewModel } from './vm/AppViewModel';
import { ChartViewModel } from './vm/ChartViewModel';

export class KnockoutComponents {
    constructor(appvm: AppViewModel) {

        ko.components.register('chart-component', {
            viewModel: {
                createViewModel: (params, componentInfo) => {
                    // - 'params' is an object whose key/value pairs are the parameters
                    //   passed from the component binding or custom element
                    // - 'componentInfo.element' is the element the component is being
                    //   injected into. When createViewModel is called, the template has
                    //   already been injected into this element, but isn't yet bound.
                    // - 'componentInfo.templateNodes' is an array containing any DOM
                    //   nodes that have been supplied to the component. See below.

                    return appvm.insertChart(params.index, params, componentInfo ? componentInfo.element : undefined);
                }
            },
            template: { element: 'chart-component-template' }
        });
    }
}
