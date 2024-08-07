export const innerCube = {
  scale: { value: 2.1, min: 0.1, max: 5, step: 0.1 },
  segments: { value: 105, min: 1, max: 500, step: 1 },
  particleSize: { value: 0.1, min: 0.001, max: 1, step: 0.001 },
  deformIntensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
  deformFrequency: { value: 1.9, min: 0, max: 5, step: 0.1 },
  deformAmplitude: { value: 0.53, min: 0, max: 1, step: 0.01 },
  deformSpeed: { value: 0.1, min: 0, max: 5, step: 0.1 },
  waveSpeed: { value: 0.7, min: 0, max: 5, step: 0.1 },
  isDeformActive: true,
  isWaveSizeActive: true,
  waveScale: { value: 1.3, min: 0, max: 5, step: 0.1 },
  waveSizeScale: { value: 0.1, min: 0, max: 0.1, step: 0.001 },
  waveColor: { value: "#ffffff" },
  baseColor: { value: "#0000ff" },
  brightness: { value: 0.55, min: 0, max: 1, step: 0.01 },
};

export const outerCube = {
  scale: { value: 3.7, min: 0.1, max: 5, step: 0.1 },
  segments: { value: 80, min: 1, max: 500, step: 1 },
  particleSize: { value: 0.12, min: 0.001, max: 1, step: 0.001 },
  deformIntensity: { value: 1.8, min: 0, max: 5, step: 0.1 },
  deformFrequency: { value: 1.9, min: 0, max: 5, step: 0.1 },
  deformAmplitude: { value: 0.4, min: 0, max: 1, step: 0.01 },
  deformSpeed: { value: 0.1, min: 0, max: 5, step: 0.1 },
  waveSpeed: { value: 1.0, min: 0, max: 5, step: 0.1 },
  isDeformActive: true,
  isWaveSizeActive: true,
  waveScale: { value: 2.4, min: 0, max: 5, step: 0.1 },
  waveSizeScale: { value: 0.001, min: 0, max: 0.1, step: 0.001 },
  waveColor: { value: "#ffffff" },
  baseColor: { value: "#000000" },
  brightness: { value: 1, min: 0, max: 2, step: 0.01 },
};
