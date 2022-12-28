class Generator {
    static #ATTRIBUTE_INDICES = {
        position: 0,
        normal: 1,
        textureCoords: 2,
    };

    constructor(conf) {
        const gl = (this.gl = document.querySelector(conf.canvasSelector).getContext("webgl2"));

        gl.canvas.width = gl.canvas.clientWidth;
        gl.canvas.height = gl.canvas.clientHeight;
    }

    gl;

    createPrograms(confs) {
        let newPrograms = {};

        for (const conf of confs) {
            newPrograms[conf.name] = this.createProgram(conf);
        }

        return newPrograms;
    }

    createProgram(conf) {
        let programData = {};
        const program = this.gl.createProgram();

        this.#prepareShader(program, this.gl.VERTEX_SHADER, conf.vShader);
        this.#prepareShader(program, this.gl.FRAGMENT_SHADER, conf.fShader);

        this.gl.linkProgram(program);

        programData.program = program;
        programData.locations = this.#initCommonLocations(program);

        return programData;
    }

    #prepareShader(program, shaderType, codeStr) {
        const shader = this.gl.createShader(shaderType);

        this.gl.shaderSource(shader, codeStr);
        this.gl.compileShader(shader);
        this.gl.attachShader(program, shader);
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

    createBufferSets(confs) {
        let newBuffersSets = {};

        for (const conf of confs) {
            newBuffersSets[conf.name] = this.createBufferSet(conf);
        }

        return newBuffersSets;
    }

    createBufferSet = (conf) => {
        const commonBuffersSettings = { size: 3 };
        const { vertices, indices, normals, textureCoords } = conf.data;
        const drawMethod = conf.drawMethod ?? this.gl.STREAM_DRAW;

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

        return buffersSet;
    };

    #createCoordsBuffer(index, bufferData, settings, drawMethod) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), drawMethod);
        this.gl.enableVertexAttribArray(index);
        this.gl.vertexAttribPointer(index, settings.size, this.gl.FLOAT, settings.normalize ?? false, 0, 0);

        return buffer;
    }

    #createIndexBuffer(bufferData, drawMethod) {
        const buffer = this.gl.createBuffer();

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(bufferData), drawMethod);

        return buffer;
    }

    redefineBufferData(target, buffer, newBufferData, drawMethod = this.gl.STREAM_DRAW) {
        let typedArray;

        switch (target) {
            case this.gl.ARRAY_BUFFER:
                typedArray = new Float32Array(newBufferData);
                break;

            case this.gl.ELEMENT_ARRAY_BUFFER:
                typedArray = new Uint16Array(newBufferData);
                break;
        }

        this.gl.bindBuffer(target, buffer);
        this.gl.bufferData(target, typedArray, drawMethod);
    }

    createTextures(confs) {
        let newTexs = {};

        for (const conf of confs) {
            newTexs[conf.name] = this.createTexture(conf);
        }

        return newTexs;
    }

    createTexture(textureConf, textureImage) {
        const { path, settings, setParams } = textureConf;
        const texture = this.gl.createTexture();
        const newTexData = { texture, settings };

        this.gl.activeTexture(this.gl[`TEXTURE${settings.unit}`]);

        if (path) {
            this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
            this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, textureImage);
            this.gl.generateMipmap(this.gl.TEXTURE_2D);
        } else {
            this.gl.bindTexture(settings.bindTarget, texture);

            if (settings.bindTarget === this.gl.TEXTURE_3D || settings.bindTarget === this.gl.TEXTURE_2D_ARRAY) {
                this.gl.texImage3D(
                    settings.texTarget,
                    0,
                    settings.internalFormat,
                    settings.width,
                    settings.height,
                    settings.depth,
                    0,
                    settings.format,
                    settings.type,
                    null
                );
            } else {
                const iterations = settings.bindTarget === this.gl.TEXTURE_CUBE_MAP ? 6 : 1; // settings.bindTarget === this.gl.TEXTURE_CUBE_MAP_ARRAY

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
        }

        setParams?.();

        return newTexData;
    }

    createTextureFromImage(textureConf) {
        let textureImage = new Image();

        textureImage.src = textureConf.path;
        textureImage.onload = () => {
            this.createTexture(textureConf, textureImage);
        };
    }

    bindTextureToUnit(unit, texture, bindTarget) {
        if (unit === 0 || unit === 1) {
            console.error(`Units 0, 1 are reserved.`);
            return;
        }

        this.gl.activeTexture(this.gl[`TEXTURE${unit}`]);
        this.gl.bindTexture(bindTarget, texture);
    }

    createFramebuffers(confs) {
        let newFbs = {};

        for (const conf of confs) {
            newFbs[conf.name] = this.createFramebuffer(conf);
        }

        return newFbs;
    }

    createFramebuffer(framebufferConf) {
        const { setTexture } = framebufferConf;
        const framebuffer = this.gl.createFramebuffer();

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
        setTexture();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        return framebuffer;
    }
}

export default Generator;
