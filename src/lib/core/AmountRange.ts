/**
 * 
 */
import { Uid } from '../model/index';

export class AmountRange {
    public uidStart: Uid;
    public uidEnd?: Uid;
    public count?: number;

    constructor(uidStart: Uid, uidEnd?: Uid, count?: number) {
        this.uidStart = uidStart;
        this.uidEnd = uidEnd;
        this.count = count;
    }

    public isEqual(other: AmountRange) {
        return (other
        && this.uidStart.compare(other.uidStart) === 0
        && (this.uidEnd === other.uidEnd || (this.uidEnd && other.uidEnd && this.uidEnd.compare(other.uidEnd) === 0))
        && (this.count === other.count));
    }
}

export class AmountRangeOps {
    public static difference(minuend: AmountRange, subtrahend: AmountRange): AmountRange[] | undefined {

        const M = minuend;
        const S = subtrahend;

        if (M.uidEnd && S.uidEnd) {

            const M1 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidEnd : M.uidStart;
            const M2 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidStart : M.uidEnd;

            const S1 = S.uidStart.compare(S.uidEnd) > 0 ? S.uidEnd : S.uidStart;
            const S2 = S.uidStart.compare(S.uidEnd) > 0 ? S.uidStart : S.uidEnd;

            if (M1.compare(S1) < 0 && M2.compare(S1) <= 0) {  // M-M S-S
                return [ new AmountRange(M1, M2) ]; // { M1, M2 };
            } else if (M1.compare(S2) >= 0 && M2.compare(S2) > 0) { // S-S M-M
                return [ new AmountRange(M1, M2) ]; //{ M1, M2};
            } else if (M1.compare(S1) >= 0 && M2.compare(S2) <= 0) { // S M M S
                return undefined;
            } else if (M1.compare(S1) < 0 && M2.compare(S2) > 0) {    // M S S M
                return [
                    new AmountRange(M1, S1),
                    new AmountRange(S2, M2) ]; //{M1, S1} + {S2, M2};
            } else if (M1.compare(S1) <= 0) {  // M S M-S
                return [ new AmountRange(M1, S1) ]; // { M1, S1 };
            } else if (M2.compare(S2) >= 0) {  // S M S-M
                return [ new AmountRange(S2, M2) ]; // { S2, M2 };
            } else {
                throw new Error('Operation exception.');
            }
        } else if (M.count !== undefined && S.uidEnd) {

            if (S.count === undefined) {
                throw new Error('When range has uidEnd it must define count.');
            }

            const M1 = M.uidStart;
            const S1 = S.uidStart.compare(S.uidEnd) > 0 ? S.uidEnd : S.uidStart;
            const S2 = S.uidStart.compare(S.uidEnd) > 0 ? S.uidStart : S.uidEnd;

            if ((M.count < 0 && M1.compare(S1) <= 0) || (M.count > 0 && M1.compare(S2) >= 0)) {
                return [ new AmountRange(M1, undefined, M.count) ]; // { M1, M.count };
            } else if (M.count < 0 && M1.compare(S2) > 0) {
                if (Math.abs(M.count) > Math.abs(S.count)) {
                    return [
                        new AmountRange(S2, M1),
                        new AmountRange(S1, undefined, M.count)
                    ];
                    //{ S2, M1 } + { S1, M.count };
                } else {
                    return [ new AmountRange(S2, M1) ]; // { S2, M1 };
                }
            } else if (M.count > 0 && M1.compare(S1) < 0) {
                if (Math.abs(M.count) > Math.abs(S.count)) {
                    return [
                        new AmountRange(M1, S1),
                        new AmountRange(S2, undefined, M.count)
                    ];
                    // { M1, S1 } + { S2, M.count };
                } else {
                    return [ new AmountRange(M1, S1) ]; // { M1, S1 };
                }
            } else if (M1.compare(S1) >= 0 && M1.compare(S2) <= 0) {
                throw new Error ('Subtrahend must not start in minuend.');
            } else {
                throw new Error('Operation exception');
            }

        } else if (M.uidEnd && S.count !== undefined) {
            if (M.count === undefined) {
                throw new Error('When range has uidEnd it must define count.');
            }

            const S1 = S.uidStart;
            const M1 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidEnd : M.uidStart;
            const M2 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidStart : M.uidEnd;

            if ((S.count < 0 && S1.compare(M1) <= 0) || (S.count > 0 && S1.compare(M2) >= 0)) {
                return [M];
            } else if (S1.compare(M1) >= 0 && S1.compare(M2) <= 0 && S.count < 0) {
                if (Math.abs(M.count) > Math.abs(S.count)) {
                    return [
                        new AmountRange(S1, M2),
                        new AmountRange(M1, undefined, S.count)
                    ];
                    // { S1, M2 } + { M1, S.count };
                } else {
                    return [ new AmountRange(S1, M2) ]; // { S1, M2 };
                }
            } else if (S1.compare(M1) >= 0 && S1.compare(M2) <= 0 && S.count > 0) {
                if (Math.abs(M.count) > Math.abs(S.count)) {
                    return [
                        new AmountRange(M1, S1),
                        new AmountRange(M2, undefined, S.count)
                    ];
                    // { M1, S1 } + { M2, S.count };
                } else {
                    return [ new AmountRange(M1, S1) ]; // { M1, S1 };
                }
            }
            throw new Error('Operation exception');
        } else if (M.count !== undefined && S.count !== undefined) {
            throw new Error('Invalid operation');
        } else {
            throw new Error('Operation exception');
        }
    }

    public static isIntersected(lhs: AmountRange, rhs: AmountRange): boolean {

        const M = lhs.uidEnd ? lhs : rhs;
        const S = lhs.uidEnd ? rhs : lhs;

        if (!M.uidEnd) {
            throw new Error('One of ranges must have specified uidEnd.');
        }

        if (M.uidEnd && S.uidEnd) {
            const diff = AmountRangeOps.difference(M, S);
            if (diff && diff.length === 1) {
                return !M.isEqual(diff[0]); // if range is the same, that means that they are not intersected.
            }
            return true;
        } else {
            const S1 = S.uidStart;
            const M1 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidEnd : M.uidStart;
            const M2 = M.uidStart.compare(M.uidEnd) > 0 ? M.uidStart : M.uidEnd;

            if (S.count === undefined) {
                throw new Error('Count and uidEnd not defined.');
            }

            if ((S1.compare(M1) <= 0 && S.count < 0) || (S1.compare(M2) >= 0 && S.count > 0)) {
                return false; // Not intersected
            } else {
                return true; // Any other case assume intersected.
            }
        }
    }
}
