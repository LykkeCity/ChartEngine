/**
 * DrawUtils class
 */
import { IPoint } from '../shared/index';

export class DrawUtils {
    /**
     * Checks wether the point lies on the specified line.
     * @param p Point to check.
     * @param p1 Start point of line.
     * @param p2 End point of line.
     */
    public static isPointInLine(p: IPoint, pa: IPoint, pb: IPoint, precision: number): boolean {

        const minx = Math.min(pa.x, pb.x);
        const maxx = Math.max(pa.x, pb.x);
        const miny = Math.min(pa.y, pb.y);
        const maxy = Math.max(pa.y, pb.y);

        // Check hitting the rectangle area around the line
        if (p.x > minx - 3 && p.x < maxx + 3 && p.y > miny - 3 && p.y < maxy + 3) {

        } else {
            return false;
        }

        // If very short line
        if (maxx - minx < 3 && maxy - miny < 3) {
            if (Math.abs(minx - p.x) < 3 && Math.abs(miny - p.y) < 3) {
                return true;
            }
            return false;
        } else {
            const diff = (p.x - pa.x) / (pb.x - pa.x) - (p.y - pa.y) / (pb.y - pa.y);
            console.debug(`diff = ${diff}`);
            return (Math.abs(diff) < precision);
        }
    }
}
