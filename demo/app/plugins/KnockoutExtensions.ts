/**
 * Custom knockout bindings 
 */
export class KnockoutExtensions {
    constructor() {
        ko.bindingHandlers.winsize = {
            init: (element, valueAccessor) => {
                $(window).resize(() => {
                    const value = valueAccessor();
                    value({ width: $(window).width(), height: $(window).height() });
                });
            }
        };

        ko.bindingHandlers.domready = {
            init: (element, valueAccessor) => {
                $(document).ready(() => {
                    const value = valueAccessor();
                    value();
                });
            }
        };

        ko.virtualElements.allowedBindings.updateListviewOnChange = true;
        ko.bindingHandlers.updateListviewOnChange = {
            update: (element, valueAccessor) => {
                ko.utils.unwrapObservable(valueAccessor());  //grab dependency

                $('.list-component').listview({ refresh: true, mini: true, icon: '' });
                $('.collapsible-component').collapsible({ refresh: true, mini: true });
            }
        };

        ko.bindingHandlers.popupVisible = {
            init: (element, valueAccessor) => {
                const unwrapValue = ko.unwrap(valueAccessor());
                console.log('popup init: ' + unwrapValue);
                $(element).draggable({ cursor: 'move' });
                $(element).popup({ history: false });
                //$(element).popup( unwrapValue ? 'open' : 'close');
            },
            update: (element, valueAccessor) => {
                const unwrapValue = ko.unwrap(valueAccessor());
                console.log('popup update: ' + unwrapValue);
                $('[data-role="popup"]').popup('close');
                $(element).popup( unwrapValue ? 'open' : 'close');
            }
        };
    }
}
