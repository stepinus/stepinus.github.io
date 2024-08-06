import React, { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import fogvert from "./fogVert.glsl";
import fogFrag from "./fogFrag.glsl";
import fogTex from "./fog.png";
import { useTexture } from "@react-three/drei";
const Fog = ({ count = 200 }) => {
  const mesh = useRef();
  //   const { viewport } = useThree();
  const texture = useTexture(fogTex);
  const uniforms = useMemo(
    () => ({
      fogDarkness: { value: 0.8 },
      fogDensity: { value: 0.8 },
      time: { value: 0 },
      tex: { value: texture },
    }),
    [texture]
  );

  const [geometry, material] = useMemo(() => {
    const geometry = new THREE.InstancedBufferGeometry();
    const baseGeometry = new THREE.PlaneGeometry(1100, 1100, 20, 20);
    geometry.copy(baseGeometry);
    const { viewport } = useThree();

    const instancePositions = new Float32Array(count * 3);
    const delays = new Float32Array(count);
    const rotates = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      instancePositions.set(
        [(Math.random() * 2 - 1) * 850, 0, (Math.random() * 2 - 1) * 300],
        i * 3
      );
      delays[i] = Math.random();
      rotates[i] = Math.random() * +1;
    }

    geometry.setAttribute(
      "instancePosition",
      new THREE.InstancedBufferAttribute(instancePositions, 3)
    );
    geometry.setAttribute(
      "delay",
      new THREE.InstancedBufferAttribute(delays, 1)
    );
    geometry.setAttribute(
      "rotate",
      new THREE.InstancedBufferAttribute(rotates, 1)
    );

    const material = new THREE.RawShaderMaterial({
      uniforms,
      vertexShader: fogvert,
      fragmentShader: fogFrag,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return [geometry, material];
  }, [count, uniforms]);

  useFrame((state, delta) => {
    if (mesh.current) {
      uniforms.time.value += delta;
    }
  });

  return <instancedMesh ref={mesh} args={[geometry, material, count]} />;
};

export default Fog;
