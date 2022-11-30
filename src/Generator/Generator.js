import MatUtils from "../utils/MatUtils.js";

class Generator {
    static #PERSPECTIVE_CONF = { fov: Math.PI / 4, near: 0.1, far: 100 };
    static #ATTRIBUTE_INDICES = {
        position: 0,
        normal: 1,
        textureCoords: 2,
    };

    constructor(conf) {
        let { canvasSelector, mode, perspectiveConf } = conf;

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

        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    gl;
    mode;
    programs = {};
    buffers = {};
    textures = {};
    framebuffers = {};
    mats = {};
    shapes = {};
    lightSystem;

    init(conf) {
        const { programs, buffers, textures, framebuffers } = conf;

        this.programs = {};
        this.buffers = {};
        this.textures = {};
        this.framebuffers = {};

        if (programs) this.createPrograms(programs);
        if (buffers) this.createBufferSets(buffers);
        if (textures) this.createTextures(textures);
        if (framebuffers) this.createFramebuffers(framebuffers);
    }

    createPrograms(programsConfs, merge = true) {
        let newPrograms = {};

        for (const programConf of programsConfs) {
            let programData = (newPrograms[programConf.name] = {});
            const program = this.gl.createProgram();

            this.#prepareShader(program, this.gl.VERTEX_SHADER, programConf.vShader);
            this.#prepareShader(program, this.gl.FRAGMENT_SHADER, programConf.fShader);

            this.gl.linkProgram(program);

            programData.program = program;
            programData.locations = this.#initCommonLocations(program);
        }

        if (merge) Object.assign(this.programs, newPrograms);

        return newPrograms;
    }

    #prepareShader(program, shaderType, codeStr) {
        const shader = this.gl.createShader(shaderType);

        this.gl.shaderSource(shader, codeStr);
        this.gl.compileShader(shader);
        this.gl.attachShader(program, shader);
    }

    createBufferSets(bufferSets) {
        for (const bufferSet of bufferSets) {
            this.createBufferSet(bufferSet)
        };
    }

    createBufferSet = (conf, merge = true) => {
        const commonBuffersSettings = { size: this.mode === "3d" ? 3 : 2 };
        const { vertices, indices, normals, textureCoords } = conf.data;
        const drawMethod = conf.drawMethod ?? this.gl.STATIC_DRAW;

        const vao = this.gl.createVertexArray();

        this.gl.bindVertexArray(vao);

        let buffersSet = {
            vao,
            vertices: this.#createCoordsBuffer(Generator.#ATTRIBUTE_INDICES.position, vertices, commonBuffersSettings, drawMethod),
        };

        if (indices?.length) {
            buffersSet.indices = this.#createIndexBuffer(indices, drawMethod);
        }

        if (normals?.length) {
            buffersSet.normals = this.#createCoordsBuffer(Generator.#ATTRIBUTE_INDICES.normal, normals, commonBuffersSettings, drawMethod);
        }

        if (textureCoords?.length) {
            buffersSet.textureCoords = this.#createCoordsBuffer(
                Generator.#ATTRIBUTE_INDICES.textureCoords,
                textureCoords,
                { size: 2, normalize: true },
                drawMethod
            );
        }

        if (merge) this.buffers[conf.name] = buffersSet

        return buffersSet
    };

    #createCoordsBuffer(index, bufferData, settings, drawMethod = this.gl.STATIC_DRAW) {
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

    createTexture(textureConf, textureImage, merge = true) {
        const { path, settings } = textureConf;
        const unit = Object.keys(this.textures).length;
        const texture = this.gl.createTexture();
        const newTexData = { texture, unit, settings };

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

        if (merge) this.textures[textureConf.name] = newTexData;

        return newTexData;
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

    createFramebuffer(framebufferConf, merge = true) {
        const { name, setTexture } = framebufferConf;
        const framebuffer = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        setTexture();

        if (merge) this.framebuffers[name] = framebuffer;

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
