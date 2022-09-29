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
    textures = {};
    animate = false;
    animData;

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
                ...ShaderUtils.initCommonLocations(this.gl, program),
                mat: this.gl.getUniformLocation(program, "u_mat"),
            };
            programData.buffers = {};

            const commonBuffersSettings = { size: this.mode === "3d" ? 3 : 2 };

            Object.entries(programConf.buffersData).forEach(([setName, data]) => {
                const { vertices, indices, normals, textureCoords } = data;
                const drawMethod = data.drawMethod ?? this.gl.STATIC_DRAW;

                const vao = this.gl.createVertexArray();

                this.gl.bindVertexArray(vao);

                let buffersSet = (programData.buffers[setName] = {
                    vao,
                    vertices: this.createVertexBuffer(programData.locations.position, vertices, commonBuffersSettings, drawMethod),
                });

                if (indices) {
                    buffersSet.indices = this.createIndexBuffer(indices, drawMethod);
                }

                if (normals) {
                    buffersSet.normals = this.createVertexBuffer(programData.locations.normal, normals, commonBuffersSettings, drawMethod);
                }

                if (textureCoords) {
                    buffersSet.textureCoords = this.createVertexBuffer(
                        programData.locations.textureCoords,
                        textureCoords,
                        { size: 2, normalize: true },
                        drawMethod
                    );
                }
            });
        });
    }

    createVertexBuffer(attrLocation, bufferData, settings, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), drawMethod);
        this.gl.enableVertexAttribArray(attrLocation);
        this.gl.vertexAttribPointer(attrLocation, settings.size, this.gl.FLOAT, settings.normalize ?? false, 0, 0);

        return buffer;
    }

    createIndexBuffer(bufferData, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bufferData), drawMethod);

        return buffer;
    }

    createTexture(name, path) {
        return new Promise((resolve) => {
            let textureImage = new Image();

            textureImage.src = path;
            textureImage.onload = () => {
                const textureSlot = Object.keys(this.textures).length;
                const texture = this.gl.createTexture();

                this.gl.activeTexture(this.gl[`TEXTURE${textureSlot}`]);
                this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
                this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);
                this.gl.generateMipmap(this.gl.TEXTURE_2D);

                this.textures[name] = textureSlot;

                resolve();
            };
        });
    }

    requestAnimationFrame = () => {
        this.animData = {
            frameDeltaTime: 0,
            deltaTime: 0,
            lastFrameTime: Date.now() / 1000,
        };

        window.requestAnimationFrame(this.#render);
    };

    #render = () => {
        const now = Date.now() / 1000;
        const elapsedTime = now - this.animData.lastFrameTime;

        this.animData.lastFrameTime = now;
        this.animData.frameDeltaTime = elapsedTime;
        this.animData.deltaTime += elapsedTime;

        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
        this.gl.clearColor(0, 0, 0, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);

        this.renderScene();

        if (this.animate) window.requestAnimationFrame(this.#render);
    };
}
