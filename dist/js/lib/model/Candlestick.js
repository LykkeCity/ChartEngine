"use strict";
var Candlestick = (function () {
    function Candlestick(date, c, o, h, l) {
        this.date = date;
        this.c = c;
        this.o = o;
        this.h = h;
        this.l = l;
    }
    Candlestick.prototype.getValues = function () {
        var ar = [];
        if (this.c) {
            ar.push(this.c);
        }
        if (this.o) {
            ar.push(this.o);
        }
        if (this.h) {
            ar.push(this.h);
        }
        if (this.l) {
            ar.push(this.l);
        }
        return ar;
    };
    Candlestick.prototype.deserialize = function (data) {
        if (data) {
            if (data.c) {
                this.c = data.c;
            }
            if (data.o) {
                this.o = data.o;
            }
            if (data.h) {
                this.h = data.h;
            }
            if (data.l) {
                this.l = data.l;
            }
        }
    };
    return Candlestick;
}());
exports.Candlestick = Candlestick;
