
//*baseColor
// :
// "#031455"
// brightness
// :
// 6.9399999999999995
// deformAmplitude
// :
// 0.22000000000000003
// deformFrequency
// :
// 0.2999999999999998
// deformIntensity
// :
// 2
// deformSpeed
// :
// 0.1
// isDeformActive
// :
// true
// isWaveSizeActive
// :
// true
// particleSize
// :
// 0.392
// scale
// :
// 4
// segments
// :
// 66
// waveColor
// :
// "#000000"
// waveScale
// :
// 1.7000000000000002
// waveSizeScale
// :
// 0.054000000000000006
// waveSpeed
// :
// 0.7*/

export const innerCube = {
  scale: { value: 5.6, min: 0.1, max: 50, step: 0.1 },
  segments: { value: 64, min: 1, max: 500, step: 1 },
  particleSize: { value: 0.5, min: 0.001, max: 10, step: 0.001 },
  deformIntensity: { value: 2.0, min: 0, max: 5, step: 0.1 },
  deformFrequency: { value: 0.9, min: 0, max: 5, step: 0.1 },
  deformAmplitude: { value: 0.2, min: 0, max: 1, step: 0.01 },
  deformSpeed: { value: 0.1, min: 0, max: 5, step: 0.1 },
  waveSpeed: { value: 0.7, min: 0, max: 5, step: 0.1 },
  isDeformActive: true,
  isWaveSizeActive: true,
  waveScale: { value: 1.7, min: 0, max: 5, step: 0.1 },
  waveSizeScale: { value: 0.05, min: 0, max: 0.1, step: 0.001 },
  waveColor: { value: "#000000" },
  baseColor: { value: "#031455" },
  brightness: { value: 10, min: 0, max: 10, step: 0.01 },
};

export const outerCube = {
  scale: { value: 9.6, min: 0.1, max: 50, step: 0.1 },
  segments: { value: 88, min: 1, max: 500, step: 1 },
  particleSize: { value: 0.12, min: 0.001, max: 10, step: 0.001 },
  deformIntensity: { value: 1.1, min: 0, max: 5, step: 0.1 },
  deformFrequency: { value: 0.5, min: 0, max: 5, step: 0.1 },
  deformAmplitude: { value: 0.54, min: 0, max: 1, step: 0.01 },
  deformSpeed: { value: 0.1, min: 0, max: 5, step: 0.1 },
  waveSpeed: { value: 0.4, min: 0, max: 5, step: 0.1 },
  isDeformActive: true,
  isWaveSizeActive: true,
  waveScale: { value: 1.1, min: 0, max: 5, step: 0.1 },
  waveSizeScale: { value: 0.05, min: 0, max: 0.1, step: 0.001 },
  waveColor: { value: "#ffffff" },
  baseColor: { value: "#000000" },
  brightness: { value: 0.33, min: 0, max: 10, step: 0.01 },
};
