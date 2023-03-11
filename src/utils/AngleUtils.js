import VecUtils from "./VecUtils.js";

export default class AngleUtils {
    static radToDeg = rad => 180 * (rad / Math.PI);
    static degToRad = deg => Math.PI * (deg / 180);

    static vecAngle(vecA, vecB, degUnit = true) {
        const rad = Math.acos(VecUtils.dot(VecUtils.normalize(vecA), VecUtils.normalize(vecB)));

        return degUnit ? AngleUtils.radToDeg(rad) : rad;
    }

    static stepCircle(points, customHandler, angleOffset = -Math.PI / 2) {
        const angleStep = (Math.PI * 2) / points;

        for (let p = 0; p < points; p++) {
            const angle = angleOffset + angleStep * p;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            customHandler(cos, sin);
        }
    }
}
