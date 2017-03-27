function getMonday(date) {
    var result = new Date(date.getTime());
    var day = date.getUTCDay() || 7;  
    if (day !== 1)
        result.setUTCHours(date.getUTCHours() - 24 * (day - 1)); 
    return result;
}

function getUtcDate(year, month, date, hour, minute, second, ms) {
    var d = new Date(Date.UTC(year, month, date || 1, hour || 0, minute || 0, second || 0, ms || 0));
    return d;
}

function truncateTime(date, timespanTicks) {
    return new Date(date.getTime() - (date.getTime() % timespanTicks));
}

module.exports = {
    addInterval: function(date, period) {
        switch (period)
        {
            case 'Sec': return new Date(date.getTime() + 1000);
            case 'Minute': return new Date(date.getTime() + 60*1000);
            case 'Hour': return new Date(date.getTime() + 60*60*1000);
            case 'Day': return new Date(date.getTime() + 24*60*60*1000);
            case 'Week': return new Date(date.getTime() + 7*24*60*60*1000);
            case 'Month': 
                var d = new Date(date.getTime());
                d.setMonth(d.getMonth() + 1);
                return d;
            default:
                throw new Error("Not expected period " + period);
        }
    },

    roundToNearest(date, period) {
        switch (period)
        {
            case 'Sec': return truncateTime(date, 1000);
            case 'Minute': return truncateTime(date, 60*1000);
            case 'Hour': return truncateTime(date, 60*60*1000);
            case 'Day': return getUtcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
            case 'Week': 
                var monday = getMonday(date);
                return getUtcDate(monday.getUTCFullYear(), monday.getUTCMonth(), monday.getUTCDate());
            case 'Month': 
                return getUtcDate(date.getUTCFullYear(), date.getUTCMonth(), 1);
            default:
                throw new Error("Not expected period " + period);
        }
    }
}
