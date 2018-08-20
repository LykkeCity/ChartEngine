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

                (<any>$('.list-component')).listview({ refresh: true, mini: true, icon: '' });
                (<any>$('.collapsible-component')).collapsible({ refresh: true, mini: true });
            }
        };

        ko.bindingHandlers.popupVisible = {
            init: (element, valueAccessor) => {
                const unwrapValue = ko.unwrap(valueAccessor());
                (<any>$(element)).draggable({ cursor: 'move' });
                (<any>$(element)).popup({ history: false });
            },
            update: (element, valueAccessor) => {
                const unwrapValue = ko.unwrap(valueAccessor());

                // close opened popups
                $('[data-role="popup"]').each((i, el) => {
                    const $el = $(el);
                    if ($el.parent().hasClass('ui-popup-active')) {
                        (<any>$el).popup('close');
                    }
                });

                (<any>$(element)).popup( unwrapValue ? 'open' : 'close');
            }
        };
    }
}
