export const BASE_PTS = [
  // outer
  [1, 1, 1],
  [-1, 1, 1],
  [-1, 1, -1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, -1, 1],
  [-1, -1, -1],
  [1, -1, -1],
  // inner
  [1, 1, 1],
  [-1, 1, 1],
  [-1, 1, -1],
  [1, 1, -1],
  [1, -1, 1],
  [-1, -1, 1],
  [-1, -1, -1],
  [1, -1, -1],
];

export const INDEX_ARRAY = [
  0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 4, 1, 5, 2, 6, 3, 7,

  8, 9, 9, 10, 10, 11, 11, 8, 12, 13, 13, 14, 14, 15, 15, 12, 8, 12, 9, 13, 10,
  14, 11, 15,

  0, 8, 1, 9, 2, 10, 3, 11, 4, 12, 5, 13, 6, 14, 7, 15,
];

export const GPOINTS_WIDTH = 100;

export const GPGPU_WIDTH = 100;
export const GPGPU_HEIGHT = 100;
export const GPGPU_MAX_RADIUS = 10;
export const GPGPU_LIMIT = 5;
