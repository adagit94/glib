class Light {
    constructor(gl, conf) {
        this.gl = gl;
        this.uniformsSources = {
            color: conf.color,
            finalMat: conf.finalMat,
            objectToLightMat: conf.objectToLightMat,
            lightPosition: conf.lightPosition,
            lightColor: conf.lightColor,
            cameraPosition: conf.cameraPosition,
            shininess: conf.shininess,
        };
    }

    gl;
    program;
    locations;
    uniformsSources;

    async init(paths) {
        const fetchConf = {
            mode: "same-origin",
            method: "GET",
        };

        let shadersFetches = [];

        shadersFetches.push(fetch(paths.vShader, fetchConf));
        shadersFetches.push(fetch(paths.fShader, fetchConf));

        let shadersSources = await Promise.all(shadersFetches);

        shadersSources = await Promise.all(shadersSources.map((res) => res.text()));

        const vShaderStr = shadersSources[0];
        const fShaderStr = shadersSources[1];

        // console.log("fShaderStr", fShaderStr)

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

        this.program = program;
        this.locations = {
            position: this.gl.getAttribLocation(program, "a_position"),
            normal: this.gl.getAttribLocation(program, "a_normal"),
            color: this.gl.getUniformLocation(program, "u_color"),
            finalMat: this.gl.getUniformLocation(program, "u_finalMat"),
            objectToLightMat: this.gl.getUniformLocation(program, "u_objectToLightMat"),
            lightPosition: this.gl.getUniformLocation(program, "u_lightPosition"),
            lightColor: this.gl.getUniformLocation(program, "u_lightColor"),
            cameraPosition: this.gl.getUniformLocation(program, "u_cameraPosition"),
            shininess: this.gl.getUniformLocation(program, "u_shininess")
        };
    };

    setUniforms() {
        this.gl.uniform3f(this.locations.color, ...this.uniformsSources.color);
        this.gl.uniformMatrix4fv(this.locations.finalMat, false, this.uniformsSources.finalMat);
        this.gl.uniformMatrix4fv(this.locations.objectToLightMat, false, this.uniformsSources.objectToLightMat);
        this.gl.uniform3f(this.locations.lightPosition, ...this.uniformsSources.lightPosition);
        this.gl.uniform3f(this.locations.lightColor, ...this.uniformsSources.lightColor);
        this.gl.uniform3f(this.locations.cameraPosition, ...this.uniformsSources.cameraPosition);
        this.gl.uniform1f(this.locations.shininess, this.uniformsSources.shininess);
    }

    getPositionLocation() {
        return this.locations.position;
    }

    getNormalLocation() {
        return this.locations.normal;
    }

    setLight = () => {
        this.gl.useProgram(this.program);
        this.setUniforms();
    };
}

export default Light;
