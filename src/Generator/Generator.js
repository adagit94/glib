import MatUtils from "../utils/MatUtils.js";

class Generator {
    static #LOCAL_FETCH_CONF = {
        mode: "same-origin",
        method: "GET",
    };

    static #PERSPECTIVE_CONF = { fov: Math.PI / 4, near: 0.1, far: 100 };

    constructor(canvasSelector, mode = "3d", perspectiveConf = Generator.#PERSPECTIVE_CONF) {
        const gl = (this.gl = document.querySelector(canvasSelector).getContext("webgl2"));

        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        this.mode = mode;

        switch (mode) {
            case "2d":
                this.mats.projection = MatUtils.init2dProjectionMat(gl.canvas.width, gl.canvas.height);
                break;

            case "3d":
                this.mats.projection = MatUtils.initPerspectiveMat(
                    perspectiveConf.fov,
                    gl.canvas.width / gl.canvas.height,
                    perspectiveConf.near,
                    perspectiveConf.far
                );
                break;
        }
    }

    gl;
    mode;
    programs = {};
    mats = {};
    textures = {};
    framebuffers = {};

    async init(programsConfs) {
        let shaderTypes = [];
        let fetches = [];

        programsConfs.forEach((programConf) => {
            const paths = Object.entries(programConf.paths);
            let programShaderTypes = [];

            paths.forEach(([shader, filePath]) => {
                let shaderType;

                switch (shader) {
                    case "vShader":
                        shaderType = this.gl.VERTEX_SHADER;
                        break;

                    case "fShader":
                        shaderType = this.gl.FRAGMENT_SHADER;
                        break;
                }

                programShaderTypes.push(shaderType);
                fetches.push(fetch(filePath, Generator.#LOCAL_FETCH_CONF));
            });

            shaderTypes.push(programShaderTypes);
        });

        let shadersSources = await Promise.all(fetches);
        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        for (let prog = 0, shaderOffset = 0; prog < programsConfs.length; prog++) {
            const programConf = programsConfs[prog];
            let programData = (this.programs[programConf.name] = {});
            const program = this.gl.createProgram();

            for (const shaderType of shaderTypes[prog]) {
                const shader = this.gl.createShader(shaderType);
                const shaderCode = shadersSources[shaderOffset];

                this.gl.shaderSource(shader, shaderCode);
                this.gl.compileShader(shader);
                this.gl.attachShader(program, shader);

                shaderOffset++;
            }

            this.gl.linkProgram(program);


            programData.program = program;
            programData.locations = this.#initCommonLocations(program);

            if (programConf.buffersData) {
                const commonBuffersSettings = { size: this.mode === "3d" ? 3 : 2 };

                programData.buffers = {};

                Object.entries(programConf.buffersData).forEach(([setName, data]) => {
                    const { vertices, indices, normals, textureCoords } = data;
                    const drawMethod = data.drawMethod ?? this.gl.STATIC_DRAW;

                    const vao = this.gl.createVertexArray();

                    this.gl.bindVertexArray(vao);

                    let buffersSet = (programData.buffers[setName] = {
                        vao,
                        vertices: this.#createVertexBuffer(programData.locations.position, vertices, commonBuffersSettings, drawMethod),
                    });

                    if (indices) {
                        buffersSet.indices = this.#createIndexBuffer(indices, drawMethod);
                    }

                    if (normals) {
                        buffersSet.normals = this.#createVertexBuffer(programData.locations.normal, normals, commonBuffersSettings, drawMethod);
                    }

                    if (textureCoords) {
                        buffersSet.textureCoords = this.#createVertexBuffer(
                            programData.locations.textureCoords,
                            textureCoords,
                            { size: 2, normalize: true },
                            drawMethod
                        );
                    }
                });
            }
        }

        return this.programs;
    }

    #createVertexBuffer(attrLocation, bufferData, settings, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), drawMethod);
        this.gl.enableVertexAttribArray(attrLocation);
        this.gl.vertexAttribPointer(attrLocation, settings.size, this.gl.FLOAT, settings.normalize ?? false, 0, 0);

        return buffer;
    }

    #createIndexBuffer(bufferData, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bufferData), drawMethod);

        return buffer;
    }

    async createTextures(texturesConf) {
        const imageLoads = Promise.all(
            texturesConf
                .filter((textureConf) => textureConf.path)
                .map(
                    (textureConf) =>
                        new Promise((resolve) => {
                            let textureImage = new Image();

                            textureImage.src = textureConf.path;
                            textureImage.onload = () => {
                                this.#createTexture(textureConf, textureImage);

                                resolve();
                            };
                        })
                )
        );

        texturesConf.filter((textureConf) => !textureConf.path).forEach((textureConf) => this.#createTexture(textureConf));

        await imageLoads;
    }

    #createTexture(texConf, texImage) {
        const { path, settings } = texConf;
        const unit = Object.keys(this.textures).length;
        const texture = this.gl.createTexture();

        this.gl.activeTexture(this.gl[`TEXTURE${unit}`]);

        if (path) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, texImage);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
            const iterations = settings.cubeMap ? 6 : 1;

            this.gl.bindTexture(settings.bindTarget, texture);

            for (let i = 0; i < iterations; i++) {
                this.gl.texImage2D(
                    settings.texTarget + i,
                    0,
                    settings.internalFormat,
                    settings.width,
                    settings.height,
                    0,
                    settings.format,
                    settings.type,
                    null
                );
            }
        }

        this.textures[texConf.name] = { texture, unit, settings };

        settings.setParams?.();
    }

    createFramebufferTexture(name, texture, settings) {
        const framebuffer = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, settings.attachment, settings.texTarget, texture, 0);

        // this.gl.readBuffer(this.gl.NONE);
        // this.gl.drawBuffers([this.gl.NONE]);

        this.framebuffers[name] = framebuffer;
    }

    #initCommonLocations = (program) => {
        this.gl.bindAttribLocation(program, 0, "a_position");
        this.gl.bindAttribLocation(program, 1, "a_normal");
        this.gl.bindAttribLocation(program, 2, "a_textureCoords");

        return {
            position: this.gl.getAttribLocation(program, "a_position"),
            normal: this.gl.getAttribLocation(program, "a_normal"),
            textureCoords: this.gl.getAttribLocation(program, "a_textureCoords"),
            color: this.gl.getUniformLocation(program, "u_color"),
            texture: this.gl.getUniformLocation(program, "u_texture"),
            finalMat: this.gl.getUniformLocation(program, "u_finalMat"),
        };
    };
}

export default Generator;
