import MatUtils from "../utils/MatUtils.js";

class Generator {
    static #PERSPECTIVE_CONF = { fov: Math.PI / 4, near: 0.1, far: 100 };

    static #ATTRIBUTE_INDICES = {
        position: 0,
        normal: 1,
        textureCoords: 2,
    };

    constructor(conf) {
        let { canvasSelector, mode, perspectiveConf, init: initConf } = conf;

        const gl = (this.gl = document.querySelector(canvasSelector).getContext("webgl2"));
        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;

        if (!mode) mode = "3d";
        this.mode = mode;

        switch (mode) {
            case "2d":
                this.mats.projection = MatUtils.projection2d(gl.canvas.width, gl.canvas.height);
                break;

            case "3d":
                if (!perspectiveConf) perspectiveConf = Generator.#PERSPECTIVE_CONF;
                this.mats.projection = MatUtils.perspective(
                    perspectiveConf.fov,
                    gl.canvas.width / gl.canvas.height,
                    perspectiveConf.near,
                    perspectiveConf.far
                );
                break;
        }

        this.#init(initConf);
    }

    gl;
    mode;
    programs;
    buffers;
    textures;
    framebuffers;
    mats = {};
    lights = {};

    #init(conf) {
        const { programs, buffers, textures, framebuffers } = conf;

        this.programs = {};
        this.buffers = {};
        this.textures = {};
        this.framebuffers = {};

        if (programs) this.createPrograms(programs);
        this.createBuffers(buffers);
        if (textures) this.createTextures(textures);
        if (framebuffers) this.createFramebuffers(framebuffers);
    }

    createPrograms(programsConfs) {
        for (const programConf of programsConfs) {
            let programData = (this.programs[programConf.name] = {});
            const program = this.gl.createProgram();

            this.#prepareShader(program, this.gl.VERTEX_SHADER, programConf.vShader)
            this.#prepareShader(program, this.gl.FRAGMENT_SHADER, programConf.fShader)

            this.gl.linkProgram(program);

            programData.program = program;
            programData.locations = this.#initCommonLocations(program);
        }
    }

    #prepareShader(program, shaderType, codeStr) {
        const shader = this.gl.createShader(shaderType);

        this.gl.shaderSource(shader, codeStr);
        this.gl.compileShader(shader);
        this.gl.attachShader(program, shader);
    }

    createBuffers(buffersData) {
        const commonBuffersSettings = { size: this.mode === "3d" ? 3 : 2 };

        Object.entries(buffersData).forEach(([setName, data]) => {
            const { vertices, indices, normals, textureCoords } = data;
            const drawMethod = data.drawMethod ?? this.gl.STATIC_DRAW;

            const vao = this.gl.createVertexArray();

            this.gl.bindVertexArray(vao);

            let buffersSet = (this.buffers[setName] = {
                vao,
                vertices: this.#createVertexBuffer(Generator.#ATTRIBUTE_INDICES.position, vertices, commonBuffersSettings, drawMethod),
            });

            if (indices) {
                buffersSet.indices = this.#createIndexBuffer(indices, drawMethod);
            }

            if (normals) {
                buffersSet.normals = this.#createVertexBuffer(Generator.#ATTRIBUTE_INDICES.normal, normals, commonBuffersSettings, drawMethod);
            }

            if (textureCoords) {
                buffersSet.textureCoords = this.#createVertexBuffer(
                    Generator.#ATTRIBUTE_INDICES.textureCoords,
                    textureCoords,
                    { size: 2, normalize: true },
                    drawMethod
                );
            }
        });
    }

    #createVertexBuffer(index, bufferData, settings, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), drawMethod);
        this.gl.enableVertexAttribArray(index);
        this.gl.vertexAttribPointer(index, settings.size, this.gl.FLOAT, settings.normalize ?? false, 0, 0);

        return buffer;
    }

    #createIndexBuffer(bufferData, drawMethod = this.gl.STATIC_DRAW) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bufferData), drawMethod);

        return buffer;
    }

    createTextures(texturesConfs) {
        for (const textureConf of texturesConfs) {
            textureConf.path ? this.createTextureFromImage(textureConf) : this.createTexture(textureConf);
        }
    }

    createTexture(textureConf, textureImage) {
        const { path, settings } = textureConf;
        const unit = Object.keys(this.textures).length;
        const texture = this.gl.createTexture();
        const texData = (this.textures[textureConf.name] = { texture, unit, settings });

        this.gl.activeTexture(this.gl[`TEXTURE${unit}`]);

        if (path) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);
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

        textureConf.setParams?.();

        return texData;
    }

    createTextureFromImage(textureConf) {
        let textureImage = new Image();

        textureImage.src = textureConf.path;
        textureImage.onload = () => {
            this.createTexture(textureConf, textureImage);
        };
    }

    createFramebuffers(framebuffersConfs) {
        for (const fbConf of framebuffersConfs) {
            this.createFramebuffer(fbConf);
        }
    }

    createFramebuffer(framebufferConf) {
        const { name, bindTexture } = framebufferConf;
        const framebuffer = (this.framebuffers[name] = this.gl.createFramebuffer());

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

        bindTexture();

        return framebuffer;
    }

    #initCommonLocations = (program) => {
        this.gl.bindAttribLocation(program, Generator.#ATTRIBUTE_INDICES.position, "a_position");
        this.gl.bindAttribLocation(program, Generator.#ATTRIBUTE_INDICES.normal, "a_normal");
        this.gl.bindAttribLocation(program, Generator.#ATTRIBUTE_INDICES.textureCoords, "a_textureCoords");

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
