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
    const coordinates = [];

    return {
      coordinates,
    }
  }
}

export default ArchivistUtils;
