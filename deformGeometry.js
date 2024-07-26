import {createNoise3D} from "simplex-noise"
const noise3D = createNoise3D();

export default function deformGeometry(originalPositions, time, intensity, frequency, amplitude) {
    const deformedPositions = new Float32Array(originalPositions.length);
  
    for (let i = 0; i < originalPositions.length; i += 3) {
      const origX = originalPositions[i];
      const origY = originalPositions[i + 1];
      const origZ = originalPositions[i + 2];
  
      const noiseValue = noise3D(
        origX * frequency + time,
        origY * frequency + time,
        origZ * frequency + time
      );
  
      const deformation = Math.sin(time * 2) * amplitude * noiseValue * intensity;
  
      deformedPositions[i] = origX + deformation;
      deformedPositions[i + 1] = origY + deformation;
      deformedPositions[i + 2] = origZ + deformation;
    }
  
    return deformedPositions;
}
