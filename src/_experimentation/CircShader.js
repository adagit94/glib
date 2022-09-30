import Shader from "./Shader.js";
import ShaderUtils from "./ShaderUtils.js";

export default class CircShader extends Shader {
    static #circRadius = 400;
    static #circGrps = 2;

    static #pointsInCircleCurveGrp = 50;
    static #verticesPerCircleCurvePoint = 50;

    static #arcLines = 125;
    static #verticesPerLine = 100;

    constructor(shaders) {
        super();

        this.init(shaders).then(([circ]) => {
            this.#circ.program = circ;

            this.#initLocations();
            this.#initObjectsData();
            this.#circ.projectionMat = ShaderUtils.mult2dMats(
                ShaderUtils.init2dProjectionMat(this.gl.canvas.width, this.gl.canvas.height),
                this.#circ.mat
            );

            this.requestAnimationFrame();
        });
    }

    #circ = (() => {
        const circlesFullCircle = true;

        const circlesCount = 50;
        const circlesVertices = 100;
        let circlesBaseR = this.gl.canvas.height - 10;
        let circlesAngle = Math.PI;

        if (circlesFullCircle) {
            circlesBaseR /= 2;
            circlesAngle *= 2;
        }

        // Parametrizace spiraly pomoci jendoducheho UI (zejmena points a pointsSpiralCircles)
        const points = 20;
        const pointsBaseR = 20;
        const pointsSpiralCircles = 39;
        const pointsVerticesPerPoint = 50;
        const pointsAngleStep = (2 * Math.PI) / pointsVerticesPerPoint;
        const pointsSpiralAngle = 2 * Math.PI * pointsSpiralCircles;

        return {
            structures: {
                circleCurves: {},
                points: {
                    points,
                    verticesPerPoint: pointsVerticesPerPoint,
                    angleStep: pointsAngleStep,
                    spiralCircles: pointsSpiralCircles,
                    baseR: pointsBaseR,
                    spiralAngle: pointsSpiralAngle,
                    rOffsetStep: pointsBaseR / points,
                    spiralAngleStep: pointsSpiralAngle / points,
                    circROffsetStep: CircShader.#circRadius / points,
                },
                lines: {},
                circles: {
                    count: circlesCount,
                    baseR: circlesBaseR,
                    vertices: circlesVertices,
                    angle: circlesAngle,
                    rOffsetFunc: "lin",
                    rOffset: circlesBaseR / circlesCount,
                    radStep: circlesAngle / circlesVertices,
                    offsetAngle: false,
                    angleOffset: Math.PI / 4 / circlesCount,
                    fullCircle: circlesFullCircle,
                },
            },
        };
    })();

    #animData = {
        pointRotation: 0,
    };

    #initLocations() {
        this.#circ.locations = {
            position: this.gl.getAttribLocation(this.#circ.program, "a_position"),
            mat: this.gl.getUniformLocation(this.#circ.program, "u_pointMat"),
            side: this.gl.getUniformLocation(this.#circ.program, "u_side"),
        };
    }

    #initObjectsData() {
        this.#circ.mat = ShaderUtils.init2dTranslationMat(this.gl.canvas.width / 2, this.gl.canvas.height / 2);

        Object.keys(this.#circ.structures).forEach((structure) => {
            this.#circ.structures[structure].vao = this.gl.createVertexArray();
            this.gl.bindVertexArray(this.#circ.structures[structure].vao);

            let coordinates;
            let drawMethod;

            switch (structure) {
                case "circleCurves":
                    coordinates = this.#getCircleCurvesCoordinates();
                    drawMethod = this.gl.DYNAMIC_DRAW;
                    break;

                case "points":
                    coordinates = this.#getPointsCoordinates();
                    drawMethod = this.gl.DYNAMIC_DRAW;
                    break;

                case "lines":
                    coordinates = this.#getLinesCoordinates();
                    drawMethod = this.gl.DYNAMIC_DRAW;
                    break;

                case "circles":
                    coordinates = this.#getCirclesCoordinates();
                    drawMethod = this.gl.STATIC_DRAW;
                    break;
            }

            this.#circ.structures[structure].coordinates = coordinates;

            this.#circ.structures[structure].buffer = this.createAndBindVerticesBuffer(
                this.#circ.locations.position,
                coordinates,
                { size: 2 },
                drawMethod
            );
        });
    }

    #getCircleCurvesCoordinates = () => {
        const radStep = (2 * Math.PI) / CircShader.#verticesPerCircleCurvePoint;
        const baseR = 12.5;
        const rOffsetStep = 0.25;

        let pointsGrpCoordinates = [];

        for (let point = 0, r = baseR; point < CircShader.#pointsInCircleCurveGrp; r -= rOffsetStep, point++) {
            for (let i = 0, rad = radStep; i < CircShader.#verticesPerCircleCurvePoint; rad += radStep, i++) {
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;

                pointsGrpCoordinates.push(x, y);
            }
        }

        return new Float32Array(pointsGrpCoordinates);
    };

    #renderCircleCurvesGrps = () => {
        const rad = this.#animData.pointRotation;
        const radOffsetStep = 0.02;

        this.gl.bindVertexArray(this.#circ.structures.circleCurves.vao);

        for (let grp = 0; grp < CircShader.#circGrps; grp++) {
            for (let point = 0, radOffset = 0; point < CircShader.#pointsInCircleCurveGrp; radOffset += radOffsetStep, point++) {
                const pointRad = rad - radOffset;

                let x = Math.cos(pointRad) * CircShader.#circRadius;
                let y = Math.sin(pointRad) * CircShader.#circRadius;

                if (grp === 1) {
                    x *= -1;
                    y *= -1;
                }

                const pointTranslationMat = ShaderUtils.init2dTranslationMat(x, y);

                this.gl.uniformMatrix3fv(this.#circ.locations.mat, false, ShaderUtils.mult2dMats(this.#circ.projectionMat, pointTranslationMat));
                this.gl.drawArrays(
                    this.gl.TRIANGLE_FAN,
                    point * CircShader.#verticesPerCircleCurvePoint,
                    CircShader.#verticesPerCircleCurvePoint - 2
                );
            }
        }
    };

    #getPointsCoordinates = () => {
        let pointsGrpCoordinates = [];

        for (
            let point = 0, r = this.#circ.structures.points.baseR;
            point < this.#circ.structures.points.points;
            r -= this.#circ.structures.points.rOffsetStep, point++
        ) {
            for (let i = 0, rad = 0; i < this.#circ.structures.points.verticesPerPoint; rad += this.#circ.structures.points.angleStep, i++) {
                const x = Math.cos(rad) * r;
                const y = Math.sin(rad) * r;

                pointsGrpCoordinates.push(x, y);
            }
        }

        return new Float32Array(pointsGrpCoordinates);
    };

    #renderPointsGrps = () => {
        const rad = this.#animData.pointRotation;

        this.gl.bindVertexArray(this.#circ.structures.points.vao);

        for (let grp = 0; grp < 1; grp++) {
            // CircShader.#circ.structures.points.circGrps
            for (
                let point = 0, radOffset = 0, r = CircShader.#circRadius;
                point < this.#circ.structures.points.points;
                radOffset += this.#circ.structures.points.spiralAngleStep, r -= this.#circ.structures.points.circROffsetStep, point++
            ) {
                const pointRad = rad - radOffset;

                let x = Math.cos(pointRad) * r;
                let y = Math.sin(pointRad) * r;

                if (grp === 1) {
                    x *= -1;
                    y *= -1;
                }

                const pointTranslationMat = ShaderUtils.init2dTranslationMat(x, y);

                this.gl.uniformMatrix3fv(this.#circ.locations.mat, false, ShaderUtils.mult2dMats(this.#circ.projectionMat, pointTranslationMat));
                this.gl.drawArrays(
                    this.gl.TRIANGLE_FAN,
                    point * this.#circ.structures.points.verticesPerPoint,
                    this.#circ.structures.points.verticesPerPoint - 2
                );
            }
        }
    };

    #getLinesCoordinates = (variant) => {
        let angle = Math.PI / 2;
        let coordinates = [];

        const lineRadOffsetStep = angle / CircShader.#arcLines;

        for (let grp = 0; grp < CircShader.#circGrps; grp++) {
            for (let line = 0, arcLength = angle; line < CircShader.#arcLines; arcLength -= lineRadOffsetStep, line++) {
                const radStep = arcLength / CircShader.#verticesPerLine;

                for (let vert = 0, rad = variant === "inversed" ? -Math.PI / 4 : 0; vert < CircShader.#verticesPerLine; rad += radStep, vert++) {
                    let x = Math.cos(rad);
                    let y = Math.sin(rad);

                    switch (variant) {
                        case "inversed":
                            x *= 300 - line;
                            y *= 300 - line;
                            break;

                        default:
                            x *= 400 - line;
                            y *= 400 - line;
                        // if (grp === 0) x *= -1;
                    }

                    coordinates.push(x, y);
                }
            }
        }

        return new Float32Array(coordinates);
    };

    #renderLines = (variant) => {
        this.gl.bindVertexArray(this.#circ.structures.lines.vao);

        for (let grp = 0; grp < CircShader.#circGrps; grp++) {
            for (let line = 0; line < CircShader.#arcLines; line++) {
                let x;
                let y;
                let rotation;

                switch (variant) {
                    case "crossed":
                        x = 666;
                        y = this.gl.canvas.height / 2;
                        rotation = Math.PI;
                        break;

                    case "inversed":
                        x = -168;
                        y = 168;

                        if (grp === 0) {
                            rotation = Math.PI;
                            y *= -1;
                        }

                        if (grp === 1) {
                            rotation = 0;
                        }
                        break;

                    default:
                        x = -225;
                        y = grp === 0 ? 100 : -100;
                        // y = this.gl.canvas.height / 2;
                        rotation = grp === 0 ? Math.PI + Math.PI / 4 : Math.PI / 4;
                }

                if (grp === 0) x *= -1;

                let lineMat = ShaderUtils.init2dTranslationMat(x, y);

                lineMat = ShaderUtils.mult2dMats(
                    lineMat,
                    ShaderUtils.init2dRotationMat(rotation) // rotation;
                );

                const sceneMat = ShaderUtils.mult2dMats(this.#circ.projectionMat, ShaderUtils.init2dRotationMat(this.#animData.pointRotation));

                this.gl.uniformMatrix3fv(this.#circ.locations.mat, false, ShaderUtils.mult2dMats(sceneMat, lineMat));

                this.gl.uniform1i(this.#circ.locations.side, grp);

                const vertexOffset = grp * CircShader.#arcLines * CircShader.#verticesPerLine + line * CircShader.#verticesPerLine;

                this.gl.drawArrays(this.gl.LINE_STRIP, vertexOffset, CircShader.#verticesPerLine - 1);
            }
        }
    };

    #getCirclesCoordinates = () => {
        let { baseR, count, rOffset, radStep, vertices, angle, offsetAngle, angleOffset, rOffsetFunc } = this.#circ.structures.circles;

        let coordinates = [];

        for (let circle = 0, radius = baseR; circle < count; circle++) {
            let rad;

            if (offsetAngle) {
                const offset = (count - circle) * angleOffset;

                radStep = (angle - 2 * offset) / vertices;
                rad = offset + radStep;
            } else {
                rad = radStep;
                coordinates.push(-Math.cos(0) * radius, -Math.sin(0) * radius);
            }

            for (let vertex = 0; vertex < vertices; vertex++, rad += radStep) {
                const x = -Math.cos(rad) * radius;
                const y = -Math.sin(rad) * radius;

                coordinates.push(x, y);
            }

            if (!offsetAngle) {
                coordinates.push(-Math.cos(rad) * radius, -Math.sin(rad) * radius);
            }

            switch (rOffsetFunc) {
                case "lin":
                    radius -= rOffset;
                    break;

                case "div2":
                    radius /= 2;
                    break;
            }
        }

        return new Float32Array(coordinates);
    };

    #renderCircles = () => {
        const { count, vertices, vao, offsetAngle, fullCircle, rOffset, baseR } = this.#circ.structures.circles;
        let linesCount = vertices - 1;

        if (!offsetAngle) {
            linesCount += 2;
        }

        this.gl.bindVertexArray(vao);

        let sceneMat = this.#circ.projectionMat;

        if (!fullCircle) {
            sceneMat = ShaderUtils.mult2dMats(sceneMat, ShaderUtils.init2dTranslationMat(0, this.gl.canvas.height / 2));
        }

        this.gl.uniformMatrix3fv(this.#circ.locations.mat, false, sceneMat);

        for (let circle = 0; circle < count; circle++) {
            let vertexOffset = vertices;

            if (!offsetAngle) {
                vertexOffset += 2;
            }

            vertexOffset *= circle;

            this.gl.drawArrays(this.gl.LINE_STRIP, vertexOffset, linesCount);
        }
    };

    renderScene = (timeNow) => {
        const timeInSecs = timeNow / 1000;
        const deltaTime = timeInSecs - this.#animData.prevAnimTime;

        this.#animData.prevAnimTime = timeInSecs;

        if (!Number.isNaN(deltaTime)) {
            this.#animData.pointRotation += deltaTime; // Math.PI / 64;
        }

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.gl.useProgram(this.#circ.program);

        // this.#renderCircleCurvesGrps();
        // this.#renderPointsGrps();
        // this.#renderLines("inversed");
        // this.#renderCircles();

        // this.requestAnimationFrame();
    };
}
