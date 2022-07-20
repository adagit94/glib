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

  static getTentaclesData(animate, animData) {
    const longerTentacleVerticesCount = 100
    const shorterTentacleVerticesCount = longerTentacleVerticesCount / 2

    const longerTentacleAngle = Math.PI / 8
    const shorterTentacleAngle = Math.PI / 4
    
    let tentacles = {
      topLeftTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        xPowResultDivider: 95,
        yPowDivider: 100,
        yPowResultDivider: 100,
      },
      topRightTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        xPowResultDivider: 95,
        yPowDivider: 100,
        yPowResultDivider: 100,
      },
      bottomRightTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        xPowResultDivider: 95,
        yPowDivider: 100,
        yPowResultDivider: 100,
      },
      bottomLeftTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        xPowResultDivider: 95,
        yPowDivider: 100,
        yPowResultDivider: 100,
        anims: {
          move: {
            xResultDividerTMult: 16,
            yResultDividerTMult: 32, 
            limit: ["x", ">", 200]
          }
        }
      }
    }
    
    tentacles = Object.entries(tentacles)

    for (const tentacle of tentacles) {
      const [location, data] = tentacle
      const {coordinates, vertices, angle, anims} = data
      const isLeftTentacle = location.includes("Left")

      let dividers = {
        xPowResultDivider: data.xPowResultDivider,
        xPowDivider: data.xPowDivider,
        yPowResultDivider: data.yPowResultDivider,
        yPowDivider: data.yPowDivider
      }
      
      if (animate) {
        if (anims) {
          dividers.xPowResultDivider += animData.deltaTime * anims.move.xResultDividerTMult; // With changing mult changing speed can be accomplished
          dividers.yPowResultDivider += animData.deltaTime * anims.move.yResultDividerTMult;

          const [limitAxis, limitOperator, limitValue] = anims.move.limit
          const currentAxisValue = dividers[`${limitAxis}PowResultDivider`]
          const limitReached = Function("val", "limit", `return val ${limitOperator} limit`)

          if (limitReached(currentAxisValue, limitValue)) {
          }
        }
      }
      
      for (
        let vertex = 1, poweredX = Math.exp((vertices - vertex + 1) / dividers.xPowDivider) / dividers.xPowResultDivider,
        poweredY = Math.exp(vertex / dividers.yPowDivider) / dividers.yPowResultDivider;
        vertex <= vertices;
        vertex++,
        poweredX += Math.exp((vertices - vertex + 1) / dividers.xPowDivider) / dividers.xPowResultDivider,
        poweredY += Math.exp(vertex / dividers.yPowDivider) / dividers.yPowResultDivider
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
