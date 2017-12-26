const utils = require('./utils')

module.exports = {
    /**
     * Generate random candles in the specified period.
     */
    generateRandom: function(asset, period, dateFrom, dateTo) {
        dateFrom = new Date(dateFrom);
        dateTo = new Date(dateTo);

        var list = [];
        var startDate = utils.roundToNearest(dateFrom, period);
        var cur = startDate;
        var close = undefined;

        while (cur.getTime() < dateTo.getTime() && cur.getTime() < (new Date()).getTime()) {
            var c = {
                t: cur
            };

            var fixed = Math.abs(Math.cos(cur.getTime() / 100)) * 1000000 + 1; // cur.getTime() % 999998 + 1;

            if (cur > new Date(2010, 1, 1)) {
                //var border = Math.round(999999.0 * (0.1 + Math.abs(Math.cos(cur.getTime()))));

                var r1 = fixed; // Math.floor((Math.random() * 999998) + 1);
                var r2 = Math.floor(fixed / 2); // Math.floor((Math.random() * 999998) + 1);

                var low = Math.min(r1, r2, isNaN(close) ? Infinity : close);
                var high = Math.max(r1, r2, isNaN(close) ? -Infinity : close);
                var open = isNaN(close) ? low + Math.floor(Math.random() * (high - low + 1)) : close;
                close = low + Math.floor(Math.random() * (high - low + 1));
                c.h = random(Math.max(open, close), high) / 10000.0;
                c.l = random(low, Math.min(open, close)) / 10000.0;
                c.o = open / 10000.0;
                c.c = close / 10000.0;
                c.v = Math.random() * 1000;
            } else {
                c.h = null;
                c.l = null;
                c.o = null;
                c.c = null;
                c.v = null;
            }

            if (cur.getTime() >= dateFrom.getTime() && cur.getTime() <= dateTo.getTime()) {
                if (cur.getDay() !== 6 && cur.getDay() !== 0) { // Do not generate for Saturday and Sunday
                    list.push(c);
                }
            }
            cur = utils.addInterval(cur, period);
        }

        return  list;
    },

    /**
     * Generate calculated candles in the specified period.
     */
    generateComputed: function(asset, period, dateFromStr, dateToStr) {
        var dateFrom = new Date(dateFromStr);
        var dateTo = new Date(dateToStr);

        var start = new Date(Date.UTC(2010, 1, 1));

        var list = [];
        var cur = utils.roundToNearest(dateFrom, period);

        while (cur.getTime() < dateTo.getTime() && cur.getTime() < (new Date()).getTime()) {
            var c = {
                t: cur,
                h: null,
                l: null,
                o: null,
                c: null,
                v: null                
            };

            if (cur > start) {
                var res;
                switch (period)
                {
                    case 'Sec': 
                        var oneMin = 60*1000;
                        var minutes = Math.floor(Math.abs((start.getTime() - cur.getTime()) / oneMin));
                        var ss = cur.getUTCSeconds();
                        res = computeCandle(ss, minutes, 45, 60);
                        break;
                    case 'Minute': 
                        var oneHour = 60*60*1000;
                        var hours = Math.floor(Math.abs((start.getTime() - cur.getTime()) / oneHour));
                        var mm = cur.getUTCMinutes();
                        res = computeCandle(mm, hours, 45, 60);
                        break;
                    case 'Hour':
                        var oneDay = 24*60*60*1000;
                        var days = Math.floor(Math.abs((start.getTime() - cur.getTime()) / oneDay));
                        var hh = cur.getUTCHours();
                        res = computeCandle(hh, days, 17, 24);
                        break;
                    case 'Day':
                        var months = monthDiff(start, cur);
                        var dd = cur.getUTCDate();
                        var daysInMonth = new Date(cur.getUTCFullYear(), cur.getUTCMonth(), 0).getDate();
                        res = computeCandle(dd, months, 21, daysInMonth);
                        break;
                    case 'Month':
                        var years = Math.abs(cur.getUTCFullYear() - start.getUTCFullYear());
                        var m = cur.getUTCMonth();
                        res = computeCandle(m, years, 7, 12);
                        break;
                    default:
                        throw new Error("Not expected period " + period);
                }

                c.h = res.high;
                c.l = res.low;
                c.o = res.open;
                c.c = res.close;
                c.v = 100;
            }

            if (cur.getTime() >= dateFrom.getTime() && cur.getTime() <= dateTo.getTime()) {
                if (cur.getUTCDay() !== 6 && cur.getUTCDay() !== 0) { // Do not generate for Saturday and Sunday
                    list.push(c);
                }
            }
            cur = utils.addInterval(cur, period);
        }

        return  list;
    } 
}

function computeCandle(curIndex, basePeriods, divider, totalIntervals) {
    var open = 0;
    var close = 0;
    var high = 0;
    var low = 0;
    
    var diff = (curIndex % 2 == 0) ? 1 : 4;

    var onePeriodIncrease = 0;

    for (var i = 0; i <= divider; i++) {
        onePeriodIncrease += (i % 2 === 0) ? 1 : 4;
    }
    for (var i = divider + 1; i < totalIntervals; i++) {
        onePeriodIncrease += (i % 2 === 0) ? -1 : -4;
    }

    open = basePeriods * onePeriodIncrease;

    if (curIndex <= divider) {
        if (curIndex % 2 === 0) {
            open += (curIndex / 2) * 5;
        } else {
            open += ((curIndex - 1) / 2) * 5 + 1;
        }
    } else {
        if (curIndex % 2 === 0) {
            open += ((curIndex / 2) - ((curIndex - (divider + 1)))) * 5;
        } else {
            open +=  (((curIndex - 1) / 2) - ((curIndex - divider - 1 - 1))) * 5 - 1;
        }
    }

    close = open + ((curIndex <= divider) ? +diff : -diff);

    high = Math.max(open, close);
    low = Math.min(open, close);

    if (diff !== 1) {
        if (curIndex <= divider) {
            open = low + 1;
            close = high - 1;
        } else {
            open = high - 1;
            close = low + 1;
        }
    }

    return {
        open: open,
        close: close,
        high: high,
        low: low
    };
}

function random(minInclusive, maxInclusive) {
    return Math.min(minInclusive, maxInclusive) + Math.random() * Math.abs(maxInclusive - minInclusive);
}

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}
