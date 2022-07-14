class ArchivistUtils {
  static getHeadData() {
    // PYRAMIDS

    const coordinates = [
      // TRIANGLE TOP MIDDLE VERTEX
      -0.5, 0.9, 0.3,

      // TRIANGLE BOTTOM MIDDLE VERTEX
      -0.5, -0.3, 0.3,
      
      // SQUARE FRONT LEFT VERTEX
      -0.8, 0.3, 0,

      // SQUARE FRONT RIGHT VERTEX
      -0.2, 0.3, 0,

      // SQUARE BACK RIGHT VERTEX
      -0.2, 0.3, 0.6,

      // SQUARE BACK LEFT VERTEX
      -0.8, 0.3, 0.6,
    ];

    const indices = [
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
    ]

    return {
      coordinates,
      indices
    }
  }
}

export default ArchivistUtils;
