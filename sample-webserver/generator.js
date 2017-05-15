const utils = require('./utils')

module.exports = {
    /**
     * Generate random candles in the specified period.
     */
    generate: function(asset, period, dateFrom, dateTo) {
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
                c.h = high / 10000.0;
                c.l = low / 10000.0;
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
                list.push(c);
            }
            cur = utils.addInterval(cur, period);
        }

        return  list;
    }
}

