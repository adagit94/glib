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
        const shadersFetches = programsConfs.flatMap((programConf) => [
            fetch(programConf.paths.vShader, Generator.#LOCAL_FETCH_CONF),
            fetch(programConf.paths.fShader, Generator.#LOCAL_FETCH_CONF),
        ]);

        let shadersSources = await Promise.all(shadersFetches);
        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        programsConfs.forEach((programConf, programI) => {
            let programData = (this.programs[programConf.name] = {});

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
        });

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
                                this.#setTexture(textureConf, textureImage);

                                resolve();
                            };
                        })
                )
        );

        texturesConf.filter((textureConf) => !textureConf.path).forEach((textureConf) => this.#setTexture(textureConf));

        await imageLoads;
    }

    #setTexture = (textureConf, textureImage) => {
        const { name, setParams, path, settings } = textureConf;

        const textureUnit = Object.keys(this.textures).length;
        const texture = this.gl.createTexture();
        const textureData = { texture, unit: textureUnit, settings };

        this.gl.activeTexture(this.gl[`TEXTURE${textureUnit}`]);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture);

        if (path) {
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);

            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
            this.gl.texImage2D(
                this.gl.TEXTURE_2D,
                0,
                settings.internalFormat ?? this.gl.RGBA,
                settings.width,
                settings.height,
                0,
                settings.format ?? this.gl.RGBA,
                settings.type ?? this.gl.UNSIGNED_BYTE,
                null
            );
        }

        setParams();

        this.textures[name] = textureData;
    };

    createFramebufferTexture(name, texture, settings) {
        const framebuffer = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, settings.attachment, this.gl.TEXTURE_2D, texture, 0);

        // this.gl.readBuffer(this.gl.NONE)
        // this.gl.drawBuffers(this.gl.NONE)

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
