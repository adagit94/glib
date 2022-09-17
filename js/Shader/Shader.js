import ShaderUtils from "./ShaderUtils.js";

export default class Shader {
    static #shaderFetchConf = {
        mode: "same-origin",
        method: "GET",
    };

    constructor(canvasSelector, mode = "2d", conf) {
        const gl = (this.gl = document.querySelector(canvasSelector).getContext("webgl2"));

        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        this.aspectRatio = gl.canvas.width / gl.canvas.height;

        this.mode = mode;

        let projectionMat;

        switch (mode) {
            case "2d":
                projectionMat = ShaderUtils.init2dProjectionMat(gl.canvas.width, gl.canvas.height);
                break;

            case "3d":
                projectionMat = ShaderUtils.initPerspectiveMat(conf.fov, this.aspectRatio, conf.near, conf.far);
                break;
        }

        this.mats = {
          projection: projectionMat,
        };
    }

    gl;
    aspectRatio;
    mode;
    programs;
    mats;
    animate = false;
    animData = {
        frameDeltaTime: 0,
        deltaTime: 0,
        prevAnimTime: 0,
    };

    async init(programsConfs) {
        const shadersFetches = programsConfs.flatMap((programConf) => [
            fetch(programConf.paths.vShader, Shader.#shaderFetchConf),
            fetch(programConf.paths.fShader, Shader.#shaderFetchConf),
        ]);

        let shadersSources = await Promise.all(shadersFetches);
        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        let programs = (this.programs = {});

        programsConfs.forEach((programConf, programI) => {
            let programData = (programs[programConf.name] = {});

            const shadersOffset = programI * 2;

            const vShaderStr = shadersSources[shadersOffset];
            const fShaderStr = shadersSources[shadersOffset + 1];

            const vShader = this.gl.createShader(this.gl.VERTEX_SHADER);
            const fShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

            this.gl.shaderSource(vShader, vShaderStr);
            this.gl.shaderSource(fShader, fShaderStr);

            this.gl.compileShader(vShader);
            this.gl.compileShader(fShader);

            const program = this.gl.createProgram();

            this.gl.attachShader(program, vShader);
            this.gl.attachShader(program, fShader);

            this.gl.linkProgram(program);

            programData.program = program;
            programData.locations = {
                position: this.gl.getAttribLocation(program, "a_position"),
                normal: this.gl.getAttribLocation(program, "a_normal"),
                mat: this.gl.getUniformLocation(program, "u_mat"),
                color: this.gl.getUniformLocation(program, "u_color"),
            };
            programData.buffers = {};

            const commonBuffersSettings = { size: this.mode === "3d" ? 3 : 2 };

            Object.entries(programConf.buffersData).forEach(([setName, data]) => {
                const { vertices, indices, normals } = data;
                const drawMethod = data.drawMethod ?? this.gl.STATIC_DRAW;

                const vao = this.gl.createVertexArray();

                this.gl.bindVertexArray(vao);

                let buffersSet = (programData.buffers[setName] = {
                    vao,
                    vertices: this.createAndBindVerticesBuffer(vertices[0], new Float32Array(vertices[1]), commonBuffersSettings, drawMethod),
                });

                if (indices) {
                    buffersSet.indices = this.createAndBindIndicesBuffer(new Uint16Array(indices), drawMethod);
                }

                if (normals) {
                    buffersSet.normals = this.createAndBindVerticesBuffer(
                        normals[0],
                        new Float32Array(normals[1]),
                        commonBuffersSettings,
                        drawMethod
                    );
                }
            });
        });
    };

    createAndBindVerticesBuffer(attrLocation, bufferData, settings, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bufferData, drawMethod);
        this.gl.enableVertexAttribArray(attrLocation);
        this.gl.vertexAttribPointer(attrLocation, settings.size, this.gl.FLOAT, false, 0, 0);

        return buffer;
    }

    createAndBindIndicesBuffer(bufferData, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, bufferData, drawMethod);

        return buffer;
    }

    #triggerFrame = (t) => this.renderScene(t);

    requestAnimationFrame = () => window.requestAnimationFrame(this.#triggerFrame);

    renderScene(timeNow) {
        const timeInSecs = timeNow / 1000;
        const deltaTime = timeInSecs - this.animData.prevAnimTime;

        this.animData.prevAnimTime = timeInSecs;
        this.animData.frameDeltaTime = deltaTime;
        this.animData.deltaTime += deltaTime;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.computeScene?.();

        if (this.animate) this.requestAnimationFrame();
    }
}
