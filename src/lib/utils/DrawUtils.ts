/**
 * DrawUtils class
 */
import { IPoint, IRect } from '../shared/index';

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

    public static IS_POINT_ON_QUADCURVE(p: IPoint, pa: IPoint, pb: IPoint, pc: IPoint, precision: number): boolean {
        const x = p.x; const y = p.y;
        const x1 = pa.x; const y1 = pa.y;
        const x2 = pb.x; const y2 = pb.y;
        const x3 = pc.x; const y3 = pc.y;

        const a = (x1 - 2 * x2 + x3);
        const b = 2 * x2 - 2 * x1;

        // Find possible "t" values
        const values = DrawUtils.SOLVE_QUAD(a, b, x1 - x).sort();
        if (values.length === 0) {
            return false;
        }

        // Compute correspondent "y" values with "t" values
        const testedY: number[] = [];
        values.forEach(t => {
            testedY.push((1 - t) * (1 - t) * y1 + 2 * (1 - t) * t * y2 + t * t * y3);
        });

        // Test point "y" value 
        return testedY.some(yt => {
            return (y >= yt - precision && y <= yt + precision);
        });
    }

    /**
     * Solves quadratic equation.
     * @param a
     * @param b
     * @param c
     */
    public static SOLVE_QUAD(a: number, b: number, c: number): number[] {
        if (a === 0) {
            return b !== 0 ? [-c / b] : [];
        }

        const d = b * b - 4 * a * c;
        if (d < 0) {
            return [];
        } else {
            return d === 0
                ? ([-b / (2 * a)])
                : [(-b + Math.sqrt(d)) / (2 * a),
                   (-b - Math.sqrt(d)) / (2 * a)];
        }
    }

    /**
     * Computes distance from a point to the specified line
     * @param p 
     * @param pa 
     * @param pb 
     */
    public static DIST_TO_LINE(p: IPoint, pa: IPoint, pb: IPoint): number {
        const distx = pb.x - pa.x;
        const disty = pb.y - pa.y;

        return (distx !== 0 || disty !== 0)
            ? Math.abs( disty * p.x - distx * p.y + pb.x * pa.y - pb.y * pa.x )
              / Math.sqrt( disty * disty + distx * distx )
            : 0;
    }

    public static DIST(pa: IPoint, pb: IPoint): number {
        const distx = pb.x - pa.x;
        const disty = pb.y - pa.y;

        return (distx !== 0 || disty !== 0)
            ? Math.sqrt(Math.pow(pb.x - pa.x, 2) + Math.pow(pb.y - pa.y, 2))
            : 0;
    }

    public static MID(pa: IPoint, pb: IPoint): IPoint {
        return { x: (pa.x + pb.x) / 2, y: (pa.y + pb.y) / 2 };
    }

    /**
     * Returns angle of the specified line in radians
     * @param pa
     * @param pb 
     */
    public static ANGLE(pa: IPoint, pb: IPoint): number {
        // angle in radians
        return Math.atan2(pb.y - pa.y, pb.x - pa.x); // in degrees: 

        // // angle in degrees
        // var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
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

    /**
     * Checks wether the point lies on the specified rectangle.
     */
    public static IS_POINT_OVER_RECT(p: IPoint, rect: IRect, precision: number): boolean {
        return (p.x >= rect.x - precision && p.x <= rect.x + rect.w + precision
           && p.y >= rect.y - precision && p.y <= rect.y + rect.h + precision);
    }

    /**
     * Linear function by two points. Returns Y value for the specifed X value.
     * @param pa 
     * @param pb 
     * @param x 
     */
    public static LINEAR(pa: IPoint, pb: IPoint, x: number): number|undefined {
        const distx = pb.x - pa.x;

        return (Math.abs(distx) > MINDIST)
            ? ((pb.x * pa.y - pa.x * pb.y) - (pa.y - pb.y) * x) / distx
            : undefined; // for vertical line
    }

    public static EXTEND(pa: IPoint, pb: IPoint, frame: IRect): IPoint {
        const x1 = pa.x; const y1 = pa.y;
        const x2 = pb.x; const y2 = pb.y;

        const a = y2 - y1;
        const b = x1 - x2;
        const c = x2 * y1 - x1 * y2;

        if (Math.abs(a) > Math.abs(b)) {
            // extending Y
            let y;
            if (y1 > y2) {
                // to lower values
                y = frame.y;
            } else {
                // to greater values
                y = frame.y + frame.h;
            }
            const x = (a !== 0) ? -(b * y + c) / a : y1;
            return { x: x, y: y };
        } else {
            // extending X
            let x;
            if (x1 > x2) {
                // to lower values
                x = frame.x;
            } else {
                // to greater values
                x = frame.x + frame.w;
            }
            const y = (b !== 0) ? -(a * x + c) / b : x1;
            return { x: x, y: y };
        }
    }
}
