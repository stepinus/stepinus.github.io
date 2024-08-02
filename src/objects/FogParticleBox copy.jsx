import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";
import vertexShader from '@shaders/foggyBox.vert'
import fragmentShader from '@shaders/foggyBox.vert'




const FogMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0xffffff),
    uOpacity: 0.8,
    uSpeed: 0.1,
    uNoiseDensity: 0.5,
    uNoiseStrength: 0.2,
    uFrequency: 0.5,
    uAmplitude: 0.1,
    uCurlFreq: 0.25,
    uOffsetSize: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ FogMaterial });

function FogParticleBox({
  count = 500000,
  position = [0, 0, 0],
  color = "#ffffff",
  opacity = 0.8,
  size = 0.01,
  cubeSize = 10,
  offsetSize = 0,
  speed = 0.1,
  noiseDensity = 0.5,
  noiseStrength = 0.2,
  frequency = 0.5,
  amplitude = 0.1,
  isAnimating = false,
}) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const adaptiveCount = Math.floor(
      (count * (Math.pow(cubeSize, 3) - Math.pow(offsetSize, 3))) /
        Math.pow(cubeSize, 3)
    );
    const positions = new Float32Array(adaptiveCount * 3);

    for (let i = 0; i < adaptiveCount; i++) {
      let x, y, z;
      do {
        x = (Math.random() - 0.5) * cubeSize;
        y = (Math.random() - 0.5) * cubeSize;
        z = (Math.random() - 0.5) * cubeSize;
      } while (
        Math.abs(x) <= offsetSize / 2 &&
        Math.abs(y) <= offsetSize / 2 &&
        Math.abs(z) <= offsetSize / 2
      );

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
    }

    return positions;
  }, [count, cubeSize, offsetSize]);

  const {
    springSpeed,
    springNoiseDensity,
    springNoiseStrength,
    springFrequency,
    springAmplitude,
  } = useSpring({
    springSpeed: isAnimating ? speed : 0,
    springNoiseDensity: isAnimating ? noiseDensity : 0,
    springNoiseStrength: isAnimating ? noiseStrength : 0,
    springFrequency: isAnimating ? frequency : 0,
    springAmplitude: isAnimating ? amplitude : 0,
    config: { mass: 1, tension: 280, friction: 120 },
  });
  console.log("Rendering FogParticleBox");
  console.log("Number of particles:", positions.length / 3);
  console.log("Cube size:", cubeSize);
  console.log("Offset size:", offsetSize);
  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.uTime = state.clock.elapsedTime;
      // console.log("Updating time:", state.clock.elapsedTime);
      mesh.current.material.uSpeed = springSpeed.get();
      mesh.current.material.uNoiseDensity = springNoiseDensity.get();
      mesh.current.material.uNoiseStrength = springNoiseStrength.get();
      mesh.current.material.uFrequency = springFrequency.get();
      mesh.current.material.uAmplitude = springAmplitude.get();
      mesh.current.material.uCurlFreq = 0.25; // Можно сделать настраиваемым
      mesh.current.material.uOffsetSize = offsetSize;
    }
  });

  if (!positions || positions.length === 0) {
    return null; // или можно вернуть заглушку, например <mesh />
  }

  return (
    <points ref={mesh} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <fogMaterial
        uColor={new THREE.Color(color)}
        uOpacity={opacity}
        uSize={5.0}
        transparent
        depthWrite={false}
      />
    </points>
  );
}

export default FogParticleBox;
