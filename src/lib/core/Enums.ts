/**
 * Core enumerations.
 */
export enum TimeInterval {
    notSet = 0,
    // TODO: Number can vary.
    month = 2592000000, // amount of milliseconds
    week = 604800000,
    day = 86400000,
    hours4 = 14400000,
    hour = 3600000,
    min30 = 1800000,
    min15 = 900000,
    min5 = 300000,
    min = 60000
}

export enum Unit {
    Price
}
