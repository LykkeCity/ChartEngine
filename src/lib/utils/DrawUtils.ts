/**
 * DrawUtils class
 */
import { IPoint } from '../core/index';

const MINDIST = 0.001;

export class DrawUtils {
    /**
     * Checks wether the point lies on the specified line.
     * @param p Point to check.
     * @param p1 Start point of line.
     * @param p2 End point of line.
     */
    public static IS_POINT_ON_LINE(p: IPoint, pa: IPoint, pb: IPoint, precision: number): boolean {

        const minx = Math.min(pa.x, pb.x);
        const maxx = Math.max(pa.x, pb.x);
        const miny = Math.min(pa.y, pb.y);
        const maxy = Math.max(pa.y, pb.y);

        // Check hitting the rectangle area around the line
        if (p.x < minx - precision || p.x > maxx + precision || p.y < miny - precision || p.y > maxy + precision) {
            return false;
        }

        const distx = pb.x - pa.x;
        const disty = pb.y - pa.y;

        if (Math.abs(distx) > MINDIST && Math.abs(disty) > MINDIST) {
            // Compute distance from a point to a line
            const dist = Math.abs( disty * p.x - distx * p.y + pb.x * pa.y - pb.y * pa.x )
                / Math.sqrt( disty * disty + distx * distx );
            return dist < precision;
        }
        return true;
    }

    /**
     * Determines if point A is near point B (i.e. distance between points is less then precision).
     * @param pa 
     * @param pb 
     * @param precision 
     */
    public static IS_POINT_OVER(pa: IPoint, pb: IPoint, precision: number): boolean {
        return Math.abs(pa.x - pb.x) < precision
               && Math.abs(pa.y - pb.y) < precision;
    }
}
