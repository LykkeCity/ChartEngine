/**
 * Custom knockout bindings 
 */
export class KnockoutExtenions {
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
    }
}
