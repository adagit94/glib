import ShaderUtils from "./ShaderUtils.js";

export default class Shader {
    static #shaderFetchConf = {
        mode: "same-origin",
        method: "GET",
    };

    constructor(mode = "2d", conf) {
        this.gl.canvas.width = this.gl.canvas.clientWidth;
        this.gl.canvas.height = this.gl.canvas.clientHeight;

        this.aspectRatio = this.gl.canvas.width / this.gl.canvas.height;

        this.mode = mode;

        let projectionMat;

        switch (mode) {
            case "2d":
                projectionMat = ShaderUtils.init2dProjectionMat(this.gl.canvas.width, this.gl.canvas.height);
                break;

            case "3d":
                projectionMat = ShaderUtils.initPerspectiveMat(conf.fov, this.aspectRatio, conf.near, conf.far);
                break;
        }

        // remove in future and change affected code
        this.projectionMat = projectionMat;

        this.mats = {
            projectionMat,
        };
    }

    gl = document.querySelector("#glFrame").getContext("webgl2");
    aspectRatio;
    mode;
    programs;
    locations;
    buffers;
    mats;
    projectionMat;
    animate = false;
    animData = {
        frameDeltaTime: 0,
        deltaTime: 0,
        prevAnimTime: 0,
    };

    initShaders = async (shadersData) => {
        let shadersFetches = [];

        Object.values(shadersData).forEach(({ vShader, fShader }) => {
            shadersFetches.push(fetch(vShader, Shader.#shaderFetchConf));
            shadersFetches.push(fetch(fShader, Shader.#shaderFetchConf));
        });

        let shadersSources = await Promise.all(shadersFetches);

        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        let programs = (this.programs = []);

        for (let i = 0; i < shadersSources.length; i += 2) {
            const vShaderStr = shadersSources[i];
            const fShaderStr = shadersSources[i + 1];

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

            // locations and buffers can be initialized here probably
            programs.push(program);
        }

        this.initCommonLocations(programs);

        return programs;
    };

    initCommonLocations(programs) {
        let locations = (this.locations = []);

        for (const program of programs) {
            locations.push({
                position: this.gl.getAttribLocation(program, "a_position"),
                normal: this.gl.getAttribLocation(program, "a_normal"),
                mat: this.gl.getUniformLocation(program, "u_mat"),
                color: this.gl.getUniformLocation(program, "u_color"),
            });
        }

        return locations;
    }

    initBuffers(programs) {
        const settings = { size: this.mode === "3d" ? 3 : 2 };

        let buffers = (this.buffers = []);

        programs.forEach((program, i) => {
            let programBuffers = (this.buffers[i] = {});

            Object.entries(program).forEach(([setName, data]) => {
                const { vertices, indices, normals } = data;
                const drawMethod = data.drawMethod ?? this.gl.STATIC_DRAW;

                const vao = this.gl.createVertexArray();

                this.gl.bindVertexArray(vao);

                let buffersSet = (programBuffers[setName] = {
                    vao,
                    vertices: this.createAndBindVerticesBuffer(vertices[0], new Float32Array(vertices[1]), settings, drawMethod),
                });

                if (indices) {
                    buffersSet.indices = this.createAndBindIndicesBuffer(new Uint16Array(indices), drawMethod);
                }

                if (normals) {
                    buffersSet.normals = this.createAndBindVerticesBuffer(normals[0], new Float32Array(normals[1]), settings, drawMethod);
                }
            });
        });

        return buffers;
    }

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
