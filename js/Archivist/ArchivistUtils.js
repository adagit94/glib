import ShaderUtils from "../Shader/ShaderUtils.js";
import { Ellipse3d } from "../Shapes/Ellipse.js";

class ArchivistUtils {
  static #pressureCirclesCommonData
  
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

  static initTentaclesData() {
    const longerTentacleVerticesCount = 100;
    const shorterTentacleVerticesCount = longerTentacleVerticesCount / 2;

    const longerTentacleAngle = Math.PI / 8;
    const shorterTentacleAngle = Math.PI / 4;
    
    let data = {
      topLeftTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 100,
        yPowResultDivider: 100,
        xResultDividerTMult: 32,
        yResultDividerTMult: 32,
        currentMove: 0,
        moves: [],
        triggerPressureOnMoves: [],
        pressurePerformedOnMoves: [],
        pressureCircles: ArchivistUtils.#initPressureCirclesData()
      },
      topRightTentacle: {
        coordinates: [],
        vertices: shorterTentacleVerticesCount,
        angle: shorterTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 24,
        yResultDividerTMult: 24,
        currentMove: 0,
        moves: [
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 65,
                tMultFinish: 0.1,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "/",
                borderOp: "<=",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 70,
                tMultFinish: 0.1,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "/",
                borderOp: "<=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 50,
                tFactor: 1.1,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 80,
                tFactor: 1.05,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 50,
                tFactor: 1.05,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.1,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 10,
                tFactor: 1.1,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 10,
                tFactor: 1.1,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 25,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 25,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 10,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 10,
                tFactor: 1.05,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.1,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.1,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 55,
                tFactor: 1.1,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 70,
                tFactor: 1.05,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 55,
                tFactor: 1.05,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.1,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 4,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
        ],
        triggerPressureOnMoves: [2, 10, 18, 26],
        pressurePerformedOnMoves: [],
        pressureCircles: ArchivistUtils.#initPressureCirclesData()
      },
      bottomLeftTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 32,
        yResultDividerTMult: 32,
        currentMove: 0,
        moves: [
          {
            delay: {
              limit: 2,
              elapsed: 0,
            },
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 50,
                tMultFinish: 0.1,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: "<=",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 50,
                tMultFinish: 0.1,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: "<=",
                finishOp: "<=",
              },
            ],
          },
          {
            delay: {
              limit: 2,
              elapsed: 0,
            },
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 16,
                tFactor: 1.04,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.04,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
          {
            delay: {
              limit: 2,
              elapsed: 0,
            },
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">=",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.1,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">=",
                finishOp: "<=",
              },
            ],
          },
        ],
        triggerPressureOnMoves: [1, 3, 5],
        pressurePerformedOnMoves: [],
        pressureCircles: ArchivistUtils.#initPressureCirclesData()
      },
      bottomRightTentacle: {
        coordinates: [],
        vertices: longerTentacleVerticesCount,
        angle: longerTentacleAngle,
        xPowDivider: 100,
        yPowDivider: 100,
        xPowResultDivider: 95,
        yPowResultDivider: 100,
        xResultDividerTMult: 64,
        yResultDividerTMult: 128,
        currentMove: 0,
        moves: [
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 145,
                tMultFinish: 6.4,
                tFactor: 1.0175,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 150,
                tMultFinish: 15,
                tFactor: 1.0175,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 0.5,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 75,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              }
            ]
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              }
            ]
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 2,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 35,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              }
            ]
          },
          {
            tMults: [
              {
                valToChangeName: "xPowResultDivider",
                tMultName: "xResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              }
            ]
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 2,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 30,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },

          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 125,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 8,
                tFactor: 1.04,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 25,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            mat: ShaderUtils.init3dRotationMat('y', -Math.PI / 4),
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 2,
                tFactor: 1.03,
                valOp: "-",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 25,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "*",
                borderOp: ">",
                finishOp: ">=",
              },
            ],
          },
          {
            tMults: [
              {
                valToChangeName: "yPowResultDivider",
                tMultName: "yResultDividerTMult",
                startChangeBorder: 0,
                tMultFinish: 2,
                tFactor: 1.03,
                valOp: "+",
                tMultOp: "/",
                borderOp: ">",
                finishOp: "<=",
              },
            ],
          },
        ],
        triggerPressureOnMoves: [2, 8, 14, 20],
        pressurePerformedOnMoves: [],
        pressureCircles: ArchivistUtils.#initPressureCirclesData()
      },
    };

    data = Object.entries(data)

    let tentaclesMoves = data.map(tentacle => tentacle[1].moves)

    for (const tentacleMoves of tentaclesMoves) {
      for (const tentacleMove of tentacleMoves) {
        let { tMults } = tentacleMove

        for (let tMult of tMults) {
          tMult.shouldChangeTMult = Function("currentVal", "borderVal", `return currentVal ${tMult.borderOp} borderVal`)
          tMult.getChangedTMult = Function("tMult", "tFactor", `return tMult ${tMult.tMultOp} tFactor`)
          tMult.getNewVal = Function("frameDeltaT", "valToChange", "tMult", `return valToChange ${tMult.valOp} frameDeltaT * tMult`)
          tMult.tMultFinishReached = Function("tMult", "tMultFinish", `return tMult ${tMult.finishOp} tMultFinish`)
        }
      }
    }

    return data
  }
  
  static computeTentaclesData(tentacles, animate, animData) {
    for (let tentacle of tentacles) {
      const [location, data] = tentacle
      const {vertices, angle, currentMove, moves} = data
      const isRightTentacle = location.includes("Right")

      let coordinates = data.coordinates = []
      
      for (
        let vertex = 1, poweredX = Math.exp((vertices - vertex + 1) / data.xPowDivider) / data.xPowResultDivider,
        poweredY = Math.exp(vertex / data.yPowDivider) / data.yPowResultDivider;
        vertex <= vertices;
        vertex++,
        poweredX += Math.exp((vertices - vertex + 1) / data.xPowDivider) / data.xPowResultDivider,
        poweredY += Math.exp(vertex / data.yPowDivider) / data.yPowResultDivider
        ) {
        let x = Math.cos(angle) * poweredX;
        const y = Math.sin(angle) * poweredY;
        const z = poweredY / 3;

        if (isRightTentacle) x *= -1

        coordinates.push(x, y, z);
      }

      if (animate) {
        const move = moves?.[currentMove]
        
        if (move) {
          const delayMove = Object.prototype.hasOwnProperty.call(move, "delay")
          let ready = true
  
          if (delayMove) {
            const { limit, elapsed } = move.delay

            move.delay.elapsed += animData.frameDeltaTime
            
            ready = elapsed >= limit
          }

          if (ready) {
            let shouldAdvanceResults = [];
            
            for (const tMult of move.tMults) {
              if (tMult.shouldChangeTMult(data[tMult.valToChangeName], tMult.startChangeBorder)) {
                data[tMult.tMultName] = Math.max(tMult.getChangedTMult(data[tMult.tMultName], tMult.tFactor), 0)
              }
              
              data[tMult.valToChangeName] = Math.max(tMult.getNewVal(animData.frameDeltaTime, data[tMult.valToChangeName], data[tMult.tMultName]), 0)

              const tMultFinishPresent = Object.prototype.hasOwnProperty.call(tMult, "tMultFinish")
              
              if (tMultFinishPresent) {
                const tMultFinishReached = tMult.tMultFinishReached(data[tMult.tMultName], tMult.tMultFinish) 
                
                shouldAdvanceResults.push(tMultFinishReached)
              }
            }

            const shouldAdvance = shouldAdvanceResults.length && shouldAdvanceResults.every(res => res)
            
            if (shouldAdvance) data.currentMove++
          }
        }
      }
    }

    tentacles = tentacles.map(([_, data]) => data)

    return tentacles
  }

  static #initPressureCirclesData() {
    let { colors, ...commonDataRest } = ArchivistUtils.#pressureCirclesCommonData
    
    colors = structuredClone(colors)
    
    return {
      lightnessOperation: "increase",
      lightnessHandlerActive: false,
      colors,
      ...commonDataRest,
    }
  }

  static initPressureCirclesCommonData(archivist, tentaclesMat, locations) {
    const circles = 5
    const r = 150
    const rx = r / archivist.gl.canvas.width
    const ry = r / archivist.gl.canvas.height

    const circle = new Ellipse3d(0, 0, 0, rx, ry, Math.PI * 2, 100)

    let colors = []
    
    const colorIntensityStep = 1 / circles
    
    for (let c = 0, colorIntensity = colorIntensityStep; c < circles; colorIntensity += colorIntensityStep, c++) {
      colors.push({
        colorIntensity,
        val: [-colorIntensity, -colorIntensity / (circles - c), 0],
      }) // Consider change of lightness (through opacity)
    }

    const vao = archivist.gl.createVertexArray();

    archivist.gl.bindVertexArray(vao);

    ArchivistUtils.#pressureCirclesCommonData = {
      vao,
      circle,
      circles,
      mat: ShaderUtils.mult3dMats(tentaclesMat, circle.mat),
      colors,
      tMult: 0.7,
      buffers: {
        vertices: archivist.createAndBindVerticesBuffer(
          locations.position,
          circle.coordinates,
          { size: 3 }
        ),
      },
      lightnessHandler(t, sourceData) {
        t *= sourceData.tMult
        
        const operation = sourceData.lightnessOperation
        
        switch (operation) {
          case "increase": {
            for (let circle = 0; circle < sourceData.circles; circle++) {
              const color = sourceData.colors[circle]

              color.val[0] += t
              color.val[1] += t / (sourceData.circles - circle)
            }

            const [sourceR, sourceG] = sourceData.colors[sourceData.colors.length - 1].val
            const fullLightness = sourceR >= 1 && sourceG >= 1;

            if (fullLightness) {
              sourceData.lightnessOperation = "decrease"
            }

            break
          }

          case "decrease": {
            for (let circle = 0; circle < sourceData.circles; circle++) {
              const color = sourceData.colors[circle]

              color.val[0] -= t
              color.val[1] -= t / (sourceData.circles - circle)
            }

            const [sourceR, sourceG] = sourceData.colors[0].val
            const noLightness = sourceR <= 0 && sourceG <= 0;

            if (noLightness) {
              sourceData.lightnessOperation = "increase"
              sourceData.lightnessHandlerActive = false
            }

            break
          }
        }
      }
    }
  }
}

export default ArchivistUtils;
