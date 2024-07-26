import * as THREE from 'three';

let explosionInProgress = false;
let explosionTime = 0;
const explosionDuration = 2; // длительность анимации в секундах
const maxExplosionDistance = 2; // максимальное расстояние разлета частиц

export function triggerExplosion(particleSystem, lineSegments) {
  if (explosionInProgress) return;
  
  explosionInProgress = true;
  explosionTime = 0;
  
  const explodingArea = selectExplodingArea();
  const affectedParticles = identifyAffectedParticles(particleSystem.geometry, explodingArea);
  
  const originalPositions = particleSystem.geometry.attributes.position.array.slice();
  const velocities = new Float32Array(particleSystem.geometry.attributes.position.array.length);
  
  // Вычисляем направление взрыва
  const explosionDirection = new THREE.Vector3();
  switch(explodingArea.side) {
    case 'front': explosionDirection.set(0, 0, 1); break;
    case 'back': explosionDirection.set(0, 0, -1); break;
    case 'left': explosionDirection.set(-1, 0, 0); break;
    case 'right': explosionDirection.set(1, 0, 0); break;
    case 'top': explosionDirection.set(0, 1, 0); break;
    case 'bottom': explosionDirection.set(0, -1, 0); break;
  }

  // Устанавливаем начальные скорости для затронутых частиц
  for (let i = 0; i < affectedParticles.length; i++) {
    const index = affectedParticles[i];
    const x = originalPositions[index * 3];
    const y = originalPositions[index * 3 + 1];
    const z = originalPositions[index * 3 + 2];
    
    const particlePos = new THREE.Vector3(x, y, z);
    const distanceFromCenter = particlePos.length();
    
    const velocity = explosionDirection.clone()
      .add(new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5).multiplyScalar(0.5))
      .normalize()
      .multiplyScalar(maxExplosionDistance / explosionDuration * (1 - distanceFromCenter / size));
    
    velocities[index * 3] = velocity.x;
    velocities[index * 3 + 1] = velocity.y;
    velocities[index * 3 + 2] = velocity.z;
  }

  // Функция обновления позиций частиц
  function updateExplosion(delta) {
    if (!explosionInProgress) return;

    explosionTime += delta;
    const progress = Math.min(explosionTime / explosionDuration, 1);

    const positions = particleSystem.geometry.attributes.position.array;

    for (let i = 0; i < affectedParticles.length; i++) {
      const index = affectedParticles[i];
      positions[index * 3] = originalPositions[index * 3] + velocities[index * 3] * progress;
      positions[index * 3 + 1] = originalPositions[index * 3 + 1] + velocities[index * 3 + 1] * progress;
      positions[index * 3 + 2] = originalPositions[index * 3 + 2] + velocities[index * 3 + 2] * progress;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;

    if (progress === 1) {
      explosionInProgress = false;
    }
  }

  return updateExplosion;
}
