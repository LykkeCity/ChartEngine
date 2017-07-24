/**
 * Tests for DateUtils class
 */
import * as core from '../../../src/lib/core/index';
import * as utils from '../../../src/lib/utils/index';
import DateUtils = utils.DateUtils;
import TimeInterval = core.TimeInterval;

describe('DateUtils tests', () => {

    it('formatDateISO method tests', () => {
        expect(DateUtils.formatDateISO(new Date(Date.UTC(2017, 1, 3)))).toEqual('2017-02-03');
    });

    it('parseISODate method tests', () => {
        const date = DateUtils.parseISODate('2017-02-03');

        expect(date.getUTCFullYear()).toEqual(2017);
        expect(date.getUTCMonth()).toEqual(1);
        expect(date.getUTCDate()).toEqual(3);
    });

    it('diffIntervals method tests', () => {
        // sec

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 0)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 0)),
            TimeInterval.sec))
            .toEqual(3600);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 0, 100)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 0, 200)),
            TimeInterval.sec))
            .toEqual(3600);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 0, 300)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 0, 200)),
            TimeInterval.sec))
            .toEqual(3599);

        // min

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 0)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 0)),
            TimeInterval.min))
            .toEqual(60);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 1)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 5)),
            TimeInterval.min))
            .toEqual(60);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 3, 10, 0, 6)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 5)),
            TimeInterval.min))
            .toEqual(59);

        // hour

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 1, 3, 11, 0, 0)),
            TimeInterval.hour))
            .toEqual(25);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 1, 3)),
            new Date(Date.UTC(2017, 1, 3, 11, 2, 4)),
            TimeInterval.hour))
            .toEqual(25);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 3, 5)),
            new Date(Date.UTC(2017, 1, 3, 11, 2, 4)),
            TimeInterval.hour))
            .toEqual(24);

        // day

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 3, 11, 0, 0)),
            TimeInterval.day))
            .toEqual(29);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 12, 0, 0)),
            new Date(Date.UTC(2017, 2, 3, 11, 0, 0)),
            TimeInterval.day))
            .toEqual(28);

        // week

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 3, 11, 0, 0)),
            TimeInterval.week))
            .toEqual(4);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 2, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 3, 11, 0, 0)),
            TimeInterval.week))
            .toEqual(0);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 2, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 9, 11, 0, 0)),
            TimeInterval.week))
            .toEqual(1);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 2, 2, 12, 0, 0)),
            new Date(Date.UTC(2017, 2, 9, 11, 0, 0)),
            TimeInterval.week))
            .toEqual(0);

        // month

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 2, 9, 0, 0)),
            TimeInterval.month))
            .toEqual(0);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 1, 11, 0, 0)),
            TimeInterval.month))
            .toEqual(0);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 27, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 1, 11, 0, 0)),
            TimeInterval.month))
            .toEqual(0);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2017, 2, 3, 11, 0, 0)),
            TimeInterval.month))
            .toEqual(1);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2018, 2, 3, 11, 0, 0)),
            TimeInterval.month))
            .toEqual(13);

        expect(DateUtils.diffIntervals(
            new Date(Date.UTC(2017, 1, 2, 10, 0, 0)),
            new Date(Date.UTC(2016, 2, 3, 11, 0, 0)),
            TimeInterval.month))
            .toEqual(10);
    });

    it('truncateToInterval method tests', () => {
        // sec
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 1, 3, 11, 0, 0, 100)), TimeInterval.sec))
            .toEqual(new Date(Date.UTC(2017, 1, 3, 11)));

        // min
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 1, 3, 11, 12, 13, 100)), TimeInterval.min))
            .toEqual(new Date(Date.UTC(2017, 1, 3, 11, 12)));

        // hour
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 1, 3, 11, 12, 13, 100)), TimeInterval.hour))
            .toEqual(new Date(Date.UTC(2017, 1, 3, 11)));

        // day
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 1, 3, 11, 12, 13, 100)), TimeInterval.day))
            .toEqual(new Date(Date.UTC(2017, 1, 3)));

        // week
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 0, 2, 11, 12, 13, 100)), TimeInterval.week))
            .toEqual(new Date(Date.UTC(2017, 0, 2)));

        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 0, 4, 11, 12, 13, 100)), TimeInterval.week))
            .toEqual(new Date(Date.UTC(2017, 0, 2)));

        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 0, 8, 11, 12, 13, 100)), TimeInterval.week))
            .toEqual(new Date(Date.UTC(2017, 0, 2)));

        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2016, 11, 30, 11, 12, 13, 100)), TimeInterval.week))
            .toEqual(new Date(Date.UTC(2016, 11, 26)));

        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 0, 1, 11, 12, 13, 100)), TimeInterval.week))
            .toEqual(new Date(Date.UTC(2016, 11, 26)));

        // month
        expect(DateUtils.truncateToInterval(new Date(Date.UTC(2017, 1, 3, 11, 12, 13, 100)), TimeInterval.month))
            .toEqual(new Date(Date.UTC(2017, 1, 1)));
    });

    it('isRound method tests', () => {
        // sec
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11, 12, 13)), TimeInterval.sec)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11, 12, 13, 14)), TimeInterval.sec)).toEqual(false);

        // min
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11, 12)), TimeInterval.min)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11, 12, 13)), TimeInterval.min)).toEqual(false);

        // hour
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11)), TimeInterval.hour)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11, 12)), TimeInterval.hour)).toEqual(false);

        // day
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3)), TimeInterval.day)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 3, 11)), TimeInterval.day)).toEqual(false);

        // week
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 0, 2)), TimeInterval.week)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 0, 2, 11, 12, 13, 100)), TimeInterval.week)).toEqual(false);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 0, 3)), TimeInterval.week)).toEqual(false);
        expect(DateUtils.isRound(new Date(Date.UTC(2016, 11, 26)), TimeInterval.week)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2016, 11, 27)), TimeInterval.week)).toEqual(false);

        // month
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 1)), TimeInterval.month)).toEqual(true);
        expect(DateUtils.isRound(new Date(Date.UTC(2017, 1, 2)), TimeInterval.month)).toEqual(false);
    });
});
