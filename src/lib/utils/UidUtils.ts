/**
 * 
 */
export class UidUtils {
    public static NEWUID(): string {
        return (Math.random() * 100000).toString();
    }
}
