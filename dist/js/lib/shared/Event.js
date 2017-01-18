/**
 * Typed events for TypeScript.
 */
"use strict";
var Event = (function () {
    function Event() {
        this.handlers = [];
    }
    Event.prototype.on = function (handler) {
        this.handlers.push(handler);
    };
    Event.prototype.off = function (handler) {
        this.handlers = this.handlers.filter(function (h) { return h !== handler; });
    };
    Event.prototype.trigger = function (data) {
        this.handlers
            .slice(0)
            .forEach(function (h) { return h(data); });
    };
    return Event;
}());
exports.Event = Event;
