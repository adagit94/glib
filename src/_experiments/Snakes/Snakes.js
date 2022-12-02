import Shader from "../Shader/Shader..js";
import ShaderUtils from "../Shader/ShaderUtils..js";

export default class Snakes extends Shader {
    constructor(shaders) {
        super();

        this.initShaders(shaders).then(([body, head, eye]) => {
            this.#body.program = body;
            this.#head.program = head;
            this.#eye.program = eye;

            this.#initLocations();
            this.#initObjectsData();

            window.requestAnimationFrame(() => this.renderScene());
        });
    }

    #projectionMat = ShaderUtils.init2dProjectionMat(this.gl.canvas.width, this.gl.canvas.height);

    #body = (() => {
        const circles = 1000;
        const verticesPerCircle = 100;
        const baseR = 50;
        const angle = Math.PI * 2;
        const rOffset = baseR / circles;
        const translationR = 300;
        const initialTranslationAngleInCircles = circles / 2;
        const initialTranslationR = translationR - baseR;
        const initialTranslationRStep = baseR / initialTranslationAngleInCircles;

        return {
            circles,
            verticesPerCircle,
            baseR,
            translationR,
            initialTranslationAngleInCircles,
            initialTranslationR,
            initialTranslationRStep,
            angle,
            rOffset,
            angleOffset: -Math.PI / 4,
            angleStep: angle / verticesPerCircle,
        };
    })();

    #head = (() => {
        const vertices = 100;
        const ellipse = Math.PI * 2;
        const rY = 150;
        const rX = rY / 2;
        const angleStep = ellipse / vertices;

        const crownStripes = 100;
        const crownVertices = 50;
        const crownAngle = Math.PI;
        const crownTranslationStartAngle = 0;
        const crownTranslationEndAngle = Math.PI / 4;
        const crownStripeAngleOffsetStep = (crownTranslationEndAngle - crownTranslationStartAngle) / crownStripes;

        return {
            vertices,
            ellipse,
            angleStep,
            rY,
            rX,
            crown: {
                stripes: crownStripes,
                vertices: crownVertices,
                angle: crownAngle,
                angleStep: crownAngle / crownVertices,
                stripeAngleOffsetStep: crownStripeAngleOffsetStep,
                translationStartAngle: crownTranslationStartAngle,
                stripeShadeStep: crownStripes / 5,
            },
        };
    })();

    #eye = (() => {
        const angle = Math.PI * 2;
        const vertices = 100;
        const outerR = 38;
        const radii = 10;

        return {
            vertices,
            angle,
            r: { outer: outerR, inner: (outerR / 100) * 25 },
            radii,
            radiiVertexStep: vertices / radii,
            angleStep: angle / vertices,
        };
    })();

    #snakes = {
        left: {
            mat: ShaderUtils.mult2dMats(
                this.#projectionMat,
                ShaderUtils.init2dTranslationMat(this.gl.canvas.width / 2 - this.#body.translationR, this.gl.canvas.height / 2)
            ),
        },
        right: {
            mat: ShaderUtils.mult2dMats(
                this.#projectionMat,
                ShaderUtils.init2dTranslationMat(this.gl.canvas.width / 2 + this.#body.translationR, this.gl.canvas.height / 2)
            ),
        },
    };

    #initLocations() {
        this.#body.locations = {
            position: this.gl.getAttribLocation(this.#body.program, "a_position"),
            mat: this.gl.getUniformLocation(this.#body.program, "u_mat"),
        };

        this.#head.locations = {
            position: this.gl.getAttribLocation(this.#head.program, "a_position"),
            mat: this.gl.getUniformLocation(this.#head.program, "u_mat"),
            shade: this.gl.getUniformLocation(this.#head.program, "u_shade"),
            zIndex: this.gl.getUniformLocation(this.#head.program, "u_zIndex"),
        };

        this.#eye.locations = {
            position: this.gl.getAttribLocation(this.#eye.program, "a_position"),
            mat: this.gl.getUniformLocation(this.#eye.program, "u_mat"),
        };
    }

    #initObjectsData() {
        this.#initBodyData();
        this.#initHeadData();
        this.#initEyeData();
    }

    #initBodyData() {
        this.#body.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.#body.vao);

        let coordinates = [];

        for (let circle = 0, r = this.#body.baseR; circle < this.#body.circles; r -= this.#body.rOffset, circle++) {
            for (let vertex = 0, angle = 0; vertex < this.#body.verticesPerCircle; angle += this.#body.angleStep, vertex++) {
                const x = Math.cos(angle) * r;
                const y = Math.sin(angle) * r;

                coordinates.push(x, y);
            }
        }

        this.#body.coordinates = new Float32Array(coordinates);
        this.#body.buffer = this.createAndBindVerticesBuffer(
            this.#body.locations.position,
            this.#body.coordinates,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );
    }

    #renderBody(side) {
        this.gl.useProgram(this.#body.program);
        this.gl.bindVertexArray(this.#body.vao);

        const radStep = (2 * Math.PI) / this.#body.circles;

        for (
            let circle = 0, radOffset = radStep, translationR = this.#body.initialTranslationR;
            circle < this.#body.circles;
            radOffset += radStep, circle++
        ) {
            const angle = this.#body.angleOffset + radOffset;

            let xOffset = -Math.cos(angle) * translationR;
            let yOffset = -Math.sin(angle) * translationR;

            if (side === "right") {
                xOffset *= -1;
            }

            if (circle >= this.#body.circles / 2) {
                let d = translationR * 2;

                if (side === "right") {
                    d *= -1;
                }

                xOffset *= -1;
                xOffset += d;
            }

            const mat = ShaderUtils.mult2dMats(this.#snakes[side].mat, ShaderUtils.init2dTranslationMat(xOffset, yOffset));

            const vertexOffset = circle * this.#body.verticesPerCircle;
            const trianglesCount = this.#body.verticesPerCircle - 2;

            this.gl.uniformMatrix3fv(this.#body.locations.mat, false, mat);

            this.gl.drawArrays(this.gl.TRIANGLE_FAN, vertexOffset, trianglesCount);

            if (circle <= this.#body.initialTranslationAngleInCircles) {
                translationR += this.#body.initialTranslationRStep;
            }
        }
    }

    #initHeadData() {
        let coordinates = [];

        for (let vertex = 0, angle = 0; vertex < this.#head.vertices; angle += this.#head.angleStep, vertex++) {
            const x = Math.cos(angle) * this.#head.rX;
            const y = Math.sin(angle) * this.#head.rY;

            coordinates.push(x, y);
        }

        this.#head.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.#head.vao);

        this.#head.coordinates = new Float32Array(coordinates);

        this.#head.buffer = this.createAndBindVerticesBuffer(
            this.#head.locations.position,
            this.#head.coordinates,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );

        let crownStripesCoordinates = [];

        for (
            let stripe = 0, stripeAngleOffset = this.#head.crown.translationStartAngle;
            stripe < this.#head.crown.stripes;
            stripeAngleOffset += this.#head.crown.stripeAngleOffsetStep, stripe++
        ) {
            const rx = Math.cos(stripeAngleOffset) * this.#head.rX;

            for (let vertex = 0, angle = this.#head.crown.angle; vertex < this.#head.crown.vertices; angle += this.#head.crown.angleStep, vertex++) {
                const x = Math.cos(angle) * rx;
                const y = Math.sin(angle) * this.#head.rY;

                crownStripesCoordinates.push(x, y);
            }
        }

        this.#head.crown.vao = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.#head.crown.vao);

        this.#head.crown.coordinates = new Float32Array(crownStripesCoordinates);

        this.#head.crown.buffer = this.createAndBindVerticesBuffer(
            this.#head.locations.position,
            this.#head.crown.coordinates,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );
    }

    #renderHead(side) {
        this.gl.useProgram(this.#head.program);
        this.gl.bindVertexArray(this.#head.vao);

        // let headX = -this.#body.translationR;
        let headX = -this.#body.translationR + this.#head.rX;
        let headRotation = Math.PI / 4;

        if (side === "right") {
            headX *= -1;
            headRotation *= -1;
        }

        this.#head.mat = ShaderUtils.mult2dMats(this.#snakes[side].mat, ShaderUtils.init2dRotationMat(headRotation));

        this.#head.mat = ShaderUtils.mult2dMats(this.#head.mat, ShaderUtils.init2dTranslationMat(headX, 0));

        this.gl.uniformMatrix3fv(this.#head.locations.mat, false, this.#head.mat);
        this.gl.uniform1f(this.#head.locations.shade, 1);

        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.#head.vertices - 2);

        this.gl.bindVertexArray(this.#head.crown.vao);

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.clearDepth(0);
        this.gl.clear(this.gl.DEPTH_BUFFER_BIT);
        this.gl.depthFunc(this.gl.GREATER);

        for (
            let stripe = 0, stripeAngleOffset = this.#head.crown.translationStartAngle, stripeShadeStep = this.#head.crown.stripeShadeStep;
            stripe < this.#head.crown.stripes;
            stripeAngleOffset += this.#head.crown.stripeAngleOffsetStep, stripe++
        ) {
            const y = Math.sin(stripeAngleOffset) * this.#head.rY;

            const stripeMat = ShaderUtils.mult2dMats(this.#head.mat, ShaderUtils.init2dTranslationMat(0, -y));

            const shade = 1 - stripeShadeStep / (this.#head.crown.stripes * 2);

            this.gl.uniformMatrix3fv(this.#head.locations.mat, false, stripeMat);
            this.gl.uniform1f(this.#head.locations.shade, shade);
            this.gl.uniform1f(this.#head.locations.zIndex, shade);

            this.gl.drawArrays(this.gl.LINE_STRIP, stripe * this.#head.crown.vertices, this.#head.crown.vertices - 1);

            if (stripe === stripeShadeStep) {
                stripeShadeStep += this.#head.crown.stripeShadeStep;
            }
        }
    }

    #initEyeData() {
        this.#eye.vao = {
            outerCircle: this.gl.createVertexArray(),
            innerCircle: this.gl.createVertexArray(),
            radii: this.gl.createVertexArray(),
        };

        let outerCircleCoordinates = [];
        let innerCircleCoordinates = [];
        let radiiCoordinates = [];

        for (let vertex = 0, angle = 0, radiiStep = 0; vertex < this.#eye.vertices; angle += this.#eye.angleStep, vertex++) {
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);

            const outerX = cos * this.#eye.r.outer;
            const outerY = sin * this.#eye.r.outer;
            const innerX = cos * this.#eye.r.inner;
            const innerY = sin * this.#eye.r.inner;

            outerCircleCoordinates.push(outerX, outerY);
            innerCircleCoordinates.push(innerX, innerY);

            if (vertex === radiiStep) {
                radiiCoordinates.push(outerX, outerY, innerX, innerY);

                radiiStep += this.#eye.radiiVertexStep;
            }
        }

        this.#eye.coordinates = {
            outerCircle: new Float32Array(outerCircleCoordinates),
            innerCircle: new Float32Array(innerCircleCoordinates),
            radii: new Float32Array(radiiCoordinates),
        };

        this.#eye.buffers = {};

        this.gl.bindVertexArray(this.#eye.vao.outerCircle);

        this.#eye.buffers.outerCircle = this.createAndBindVerticesBuffer(
            this.#eye.locations.position,
            this.#eye.coordinates.outerCircle,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );

        this.gl.bindVertexArray(this.#eye.vao.innerCircle);

        this.#eye.buffers.innerCircle = this.createAndBindVerticesBuffer(
            this.#eye.locations.position,
            this.#eye.coordinates.innerCircle,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );

        this.gl.bindVertexArray(this.#eye.vao.radii);

        this.#eye.buffers.radii = this.createAndBindVerticesBuffer(
            this.#eye.locations.position,
            this.#eye.coordinates.radii,
            { size: 2 },
            this.gl.DYNAMIC_DRAW
        );
    }

    #renderEye() {
        this.#eye.mat = ShaderUtils.mult2dMats(this.#head.mat, ShaderUtils.init2dTranslationMat(0, 0));

        this.gl.useProgram(this.#eye.program);

        this.gl.uniformMatrix3fv(this.#eye.locations.mat, false, this.#eye.mat);

        this.gl.bindVertexArray(this.#eye.vao.outerCircle);
        this.gl.drawArrays(this.gl.LINE_LOOP, 0, this.#eye.vertices);

        this.gl.bindVertexArray(this.#eye.vao.innerCircle);
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, 0, this.#eye.vertices - 2);

        this.gl.bindVertexArray(this.#eye.vao.radii);
        this.gl.drawArrays(this.gl.LINES, 0, this.#eye.radii * 2);
    }

    #renderSnake(side) {
        this.#renderBody(side);
        this.#renderHead(side);
        this.#renderEye();
    }

    renderScene(timeNow) {
        super.renderScene(timeNow);

        const { deltaTime } = this.animData;

        this.#renderSnake("left");
        this.#renderSnake("right");

        // window.requestAnimationFrame(this.renderScene);
    }
}

// new Snakes({
//   body: {
//     vShader: "shaders/snakes/body/body.vert",
//     fShader: "shaders/snakes/body/body.frag",
//   },
//   head: {
//     vShader: "shaders/snakes/head/head.vert",
//     fShader: "shaders/snakes/head/head.frag",
//   },
//   eye: {
//     vShader: "shaders/snakes/head/eye/eye.vert",
//     fShader: "shaders/snakes/head/eye/eye.frag",
//   },
// });
