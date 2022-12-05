export default class AngleUtils {
    static radToDeg = (rad) => 180 * (rad / Math.PI)
    static degToRad = (deg) => Math.PI * (deg / 180)
}