/**
 * JsonUtils tests
 */
import * as utils from '../../../src/lib/utils/index';

describe('JsonUtils tests', () => {

    it('Failed parse', () => {
        let res = utils.JsonUtils.DATEPARSER('', '');
        expect(res).toEqual('');

        res = utils.JsonUtils.DATEPARSER('', undefined);
        expect(res).toBeUndefined();
    });

    it('Parse ISO date (UTC)', () => {
        const date = <Date>utils.JsonUtils.DATEPARSER('', '2017-02-03T20:05:06.190Z');
        expect(date.getTime()).toEqual(new Date(Date.UTC(2017, 1, 3, 20, 5, 6, 190)).getTime());

        // check utc values (local date is changed)
        expect(date.getUTCDate()).toEqual(3);
        expect(date.getUTCHours()).toEqual(20);
    });

    it('Parse ISO date (local time)', () => {
        let date = <Date>utils.JsonUtils.DATEPARSER('', '2017-02-03T20:05:06.190+07:00');
        expect(date.getTime()).toEqual(new Date(Date.UTC(2017, 1, 3, 13, 5, 6, 190)).getTime());

        // checking utc values
        expect(date.getUTCDate()).toEqual(3);
        expect(date.getUTCHours()).toEqual(13);

        date = <Date>utils.JsonUtils.DATEPARSER('', '2017-02-03T20:05:06.190-07:00');
        expect(date.getTime()).toEqual(new Date(Date.UTC(2017, 1, 4, 3, 5, 6, 190)).getTime());

        // check utc values
        expect(date.getUTCDate()).toEqual(4);
        expect(date.getUTCHours()).toEqual(3);
    });

    it('Parse MS date', () => {
        const date = <Date>utils.JsonUtils.DATEPARSER('', '\/Date(1486152306190)\/');    // 2017-02-03 20:05:06 (UTC)
        expect(date.getTime()).toEqual(new Date(Date.UTC(2017, 1, 3, 20, 5, 6, 190)).getTime());

        // checking utc values
        expect(date.getUTCDate()).toEqual(3);
        expect(date.getUTCHours()).toEqual(20);
    });

    // TODO: Implement parsing time zone
    it('Parse MS date with time zone', () => {
        const date = <Date>utils.JsonUtils.DATEPARSER('', '\/Date(1486152306190-0700)\/');    // 2017-02-03 20:05:06
        expect(date.getTime()).toEqual(new Date(Date.UTC(2017, 1, 3, 20, 5, 6, 190)).getTime());

        // checking utc values
        expect(date.getUTCDate()).toEqual(3);
        expect(date.getUTCHours()).toEqual(20);
    });
});
