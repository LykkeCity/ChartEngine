/**
 * jQuery UI Touch Punch 0.2.3
 *
 * Copyright 2011–2014, Dave Furfero
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Depends:
 *  jquery.ui.widget.js
 *  jquery.ui.mouse.js
 */
export function jQueryExtensions() {
    (($) => {
        function f(ev: any, evType: string) {
            if (!(ev.originalEvent.touches.length > 1)) {
                ev.preventDefault();
                const c = ev.originalEvent.changedTouches[0];
                const d = document.createEvent('MouseEvents');
                d.initMouseEvent(evType, !0, !0, window, 1, c.screenX, c.screenY, c.clientX, c.clientY, !1, !1, !1, !1, 0, null);
                ev.target.dispatchEvent(d);
            }
        }

        if ('ontouchend' in document) {

            let e: any;
            const $mouseproto = (<any>$).ui.mouse.prototype;
            const c = $mouseproto._mouseInit;
            const d = $mouseproto._mouseDestroy;

            $mouseproto._touchStart = function (ev: any) {
                const self = this;
                !e && self._mouseCapture(ev.originalEvent.changedTouches[0]) && (e = !0, self._touchMoved = !1, f(ev, 'mouseover'), f(ev, 'mousemove'), f(ev, 'mousedown'))
            };

            $mouseproto._touchMove = function (ev: any) {
                e && (this._touchMoved = !0, f(ev, 'mousemove'))
            };

            $mouseproto._touchEnd = function (ev: any) {
                e && (f(ev, 'mouseup'), f(ev, 'mouseout'), this._touchMoved || f(ev, 'click'), e = !1)
            };

            $mouseproto._mouseInit = function () {
                const self = this;
                self.element.bind({
                    touchstart: $.proxy(self, '_touchStart'),
                    touchmove: $.proxy(self, '_touchMove'),
                    touchend: $.proxy(self, '_touchEnd')
                });
                c.call(self);
            };

            $mouseproto._mouseDestroy = function () {
                const self = this;
                self.element.unbind({
                    touchstart: $.proxy(self, '_touchStart'),
                    touchmove: $.proxy(self, '_touchMove'),
                    touchend: $.proxy(self, '_touchEnd')
                });
                d.call(self);
            };
        }
    })(jQuery);
}
