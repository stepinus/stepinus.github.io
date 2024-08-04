import React, { useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { createCubeLines, createCubePoints } from "./utils";

// Import your custom shaders
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";

const BloomCube = ({
  scale= 1,
  segments = 30,
  particleSize = 0.02,
  deformIntensity = 1.0,
  deformFrequency = 1.0,
  deformAmplitude = 0.1,
  deformSpeed = 1.0,
  waveSpeed = 1.0,
  isDeformActive = true,
  isWaveSizeActive = true,
  waveScale = 1.0,
  waveSizeScale = 0.02,
  waveColor = [0, 0, 1],
  baseColor = [1, 1, 1],
  bloomStrength = 0.01,
  bloomRadius = 0.4,
  bloomThreshold = 0.85,
  brightness = 0.8,
}) => {
  const { particles, sizes, isPoint } = useMemo(
    () => createCubePoints(segments, scale, particleSize),
    [segments, particleSize, scale]
  );
  const { lines, isPoint: lineIsPoint } = useMemo(
    () => createCubeLines(segments, scale),
    [segments, scale]
  );

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([...particles, ...lines], 3)
    );
    geo.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(
        [...sizes, ...new Array(lines.length / 3).fill(1)],
        1
      )
    );
    geo.setAttribute(
      "isPoint",
      new THREE.Float32BufferAttribute([...isPoint, ...lineIsPoint], 1)
    );
    return geo;
  }, [particles, lines, sizes, isPoint, lineIsPoint]);

  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: {
          value: new THREE.TextureLoader().load(
            "/path/to/your/spark-texture.png"
          ),
        },
        time: { value: 0 },
        intensity: { value: deformIntensity },
        frequency: { value: deformFrequency },
        amplitude: { value: deformAmplitude },
        isDeformActive: { value: isDeformActive },
        isWaveSizeActive: { value: isWaveSizeActive },
        waveScale: { value: waveScale },
        waveSpeed: { value: waveSpeed },
        waveSizeScale: { value: waveSizeScale },
        baseParticleSize: { value: particleSize },
        baseColor: { value: new THREE.Color(...baseColor) },
        waveColor: { value: new THREE.Color(...waveColor) },
        brightness: { value: brightness },
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [
    deformIntensity,
    deformFrequency,
    deformAmplitude,
    isDeformActive,
    isWaveSizeActive,
    waveScale,
    waveSpeed,
    waveSizeScale,
    particleSize,
    baseColor,
    waveColor,
    brightness,
  ]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    material.uniforms.time.value = time * deformSpeed;
  });

  return (
    <EffectComposer>
      <Bloom
        intensity={bloomStrength}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.9}
        radius={bloomRadius}
      />
      <points geometry={geometry} material={material} />
      <lineSegments geometry={geometry} material={material} />
    </EffectComposer>
  );
};




export default BloomCube;
