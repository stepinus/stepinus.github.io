import * as THREE from "three";
import { createNoise3D } from "simplex-noise";

const noise3D = createNoise3D();

export const ruptureSettings = {
  ruptureX: 0,
  ruptureY: 0,
  ruptureZ: 1,
  ruptureRadius: 0.5,
  ruptureStrength: 0.5,
  ruptureRoughness: 0.2,
  ruptureFrequency: 1,
};

export function addRuptureControls(gui, settings) {
  const ruptureFolder = gui.addFolder("Rupture");
  ruptureFolder.add(settings, "ruptureX", -1, 1, 0.01).name("Rupture X");
  ruptureFolder.add(settings, "ruptureY", -1, 1, 0.01).name("Rupture Y");
  ruptureFolder.add(settings, "ruptureZ", -1, 1, 0.01).name("Rupture Z");
  ruptureFolder
    .add(settings, "ruptureRadius", 0, 1, 0.01)
    .name("Rupture Radius");
  ruptureFolder
    .add(settings, "ruptureStrength", 0, 1, 0.01)
    .name("Rupture Strength");
  ruptureFolder
    .add(settings, "ruptureRoughness", 0, 1, 0.01)
    .name("Rupture Roughness");
  ruptureFolder
    .add(settings, "ruptureFrequency", 0, 5, 0.1)
    .name("Rupture Frequency");
}

export function createRupture(geometry, deformedPositions, center, radius, strength, roughness, frequency) {
    const positions = geometry.attributes.position.array;
    const removedPoints = new Set();
    const epsilon = radius * 0.1; // Радиус, в котором точки будут полностью удалены
    
    for (let i = 0; i < positions.length; i += 3) {
      const particlePosition = new THREE.Vector3(
        deformedPositions[i],
        deformedPositions[i + 1],
        deformedPositions[i + 2]
      );
      
      const distance = particlePosition.distanceTo(center);
      
      if (distance < epsilon) {
        // Полностью удаляем точку, устанавливая ее позицию за пределами видимости
        positions[i] = Infinity;
        positions[i + 1] = Infinity;
        positions[i + 2] = Infinity;
        removedPoints.add(i / 3);
      } else if (distance < radius) {
        const direction = particlePosition.sub(center).normalize();
        
        const noiseValue = noise3D(
          particlePosition.x * frequency,
          particlePosition.y * frequency,
          particlePosition.z * frequency
        );
        const noisyRadius = radius * (1 + roughness * noiseValue);
        
        const displacementStrength = strength * (noisyRadius - distance) / noisyRadius;
        const displacement = direction.multiplyScalar(displacementStrength);
        
        positions[i] = deformedPositions[i] + displacement.x;
        positions[i + 1] = deformedPositions[i + 1] + displacement.y;
        positions[i + 2] = deformedPositions[i + 2] + displacement.z;
      } else {
        positions[i] = deformedPositions[i];
        positions[i + 1] = deformedPositions[i + 1];
        positions[i + 2] = deformedPositions[i + 2];
      }
    }
    
    geometry.attributes.position.needsUpdate = true;
    return removedPoints;
  }
  
  export function updateLines(lineGeometry, removedPoints) {
    const positions = lineGeometry.attributes.position.array;
    const newPositions = [];
  
    for (let i = 0; i < positions.length; i += 6) {
      const startIndex = i / 3;
      const endIndex = startIndex + 1;
  
      if (!removedPoints.has(startIndex) && !removedPoints.has(endIndex)) {
        newPositions.push(
          positions[i], positions[i+1], positions[i+2],
          positions[i+3], positions[i+4], positions[i+5]
        );
      }
    }
  
    lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(newPositions, 3));
    lineGeometry.attributes.position.needsUpdate = true;
  }