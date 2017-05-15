/**
 * 
 */
export class StringUtils {
    /**
     * Compares strings before specified character.
     * @param lhs
     * @param rhs 
     * @param character 
     */
    public static compare(lhs: string, rhs: string, character: string) {
        const i1 = lhs.indexOf(character);
        const i2 = rhs.indexOf(character);

        return ((i1 !== -1 ) ? lhs.substring(0, i1) : lhs)
                === ((i2 !== -1 ) ? rhs.substring(0, i2) : rhs);
    }
}