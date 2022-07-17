class ArchivistUtils {
  static getHeadData() {
    // PYRAMIDS

    const coordinates = new Float32Array([
      // TRIANGLE TOP MIDDLE VERTEX
      0, 0.6, 0,

      // TRIANGLE BOTTOM MIDDLE VERTEX
      0, -0.6, 0,
      
      // SQUARE FRONT LEFT VERTEX
      -0.3, 0, 0.3,

      // SQUARE FRONT RIGHT VERTEX
      0.3, 0, 0.3,

      // SQUARE BACK RIGHT VERTEX
      0.3, 0, -0.3,

      // SQUARE BACK LEFT VERTEX
      -0.3, 0, -0.3,
    ]);

    const indices = new Uint16Array([
      // TOP FRONT TRIANGLE
      0, 2, 3,

      // TOP RIGHT TRIANGLE
      0, 3, 4,

      // TOP BACK TRIANGLE
      0, 4, 5,

      // TOP LEFT TRIANGLE
      0, 2, 5,


      // BOTTOM FRONT TRIANGLE
      1, 2, 3,

      // BOTTOM RIGHT TRIANGLE
      1, 3, 4,

      // BOTTOM BACK TRIANGLE
      1, 4, 5,

      // BOTTOM LEFT TRIANGLE
      1, 2, 5,
    ])

    return {
      coordinates,
      indices
    }
  }

  static getTentaclesData() {
    const longerTentacleVerticesCount = 100
    const shorterTentacleVerticesCount = longerTentacleVerticesCount / 2

    const longerTentacleAngle = Math.PI / 8
    const shorterTentacleAngle = Math.PI / 4
    
    let tentacles = {
      topLeftTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
      },
      topRightTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
      },
      bottomLeftTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
      },
      bottomRightTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
      }
    }

    tentacles = Object.entries(tentacles)

    const xPowDivider = 100
    const xPowResultDivider = 75
    const yPowDivider = 100
    const yPowResultDivider = 100
    
    for (const tentacle of tentacles) {
      const [location, data]  = tentacle
      const {coordinates, vertices, angle} = data
      const isLeftTentacle = location.includes("Left")
      
      for (
        let vertex = 1, poweredX = Math.exp((vertices - vertex + 1) / xPowDivider) / xPowResultDivider,
        poweredY = Math.exp(vertex / yPowDivider) / yPowResultDivider;
        vertex <= vertices;
        vertex++,
        poweredX += Math.exp((vertices - vertex + 1) / xPowDivider) / xPowResultDivider,
        poweredY += Math.exp(vertex / yPowDivider) / yPowResultDivider
        ) {
        let x = Math.cos(angle) * poweredX;
        const y = Math.sin(angle) * poweredY;
        const z = poweredY / 3;

        if (isLeftTentacle) x *= -1

        coordinates.push(x, y, z);
      }
    }

    tentacles = tentacles.map(([_, data]) => data)

    return tentacles
  }
}

export default ArchivistUtils;
