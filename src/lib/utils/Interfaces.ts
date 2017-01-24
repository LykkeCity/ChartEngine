/**
 * 
 */
export interface IComparer<T> {
    (lhs: T, rhs: T): number;
}
