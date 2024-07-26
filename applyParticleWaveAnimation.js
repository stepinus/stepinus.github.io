import { createNoise3D } from "simplex-noise";
import * as THREE from "three";

const noise3D = createNoise3D();

function getNoiseValue(x, y, z, scale = 1) {
  return noise3D(x * scale, y * scale, z * scale);
}
export default function applyParticleWaveAnimation(
  particleSystem,
  time,
  waveScale,
  waveSpeed,
  sizeScale,
  settings
) {
  const positions = particleSystem.geometry.attributes.position.array;
  const sizes = particleSystem.geometry.attributes.size.array;

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];

    const noiseValue = getNoiseValue(
      x + time * waveSpeed,
      y + time * waveSpeed,
      z + time * waveSpeed,
      waveScale
    );

    const size = (noiseValue + 1) * 0.5 * sizeScale + settings.particleSize;
    sizes[i / 3] = size;
  }

  particleSystem.geometry.attributes.size.needsUpdate = true;
}
