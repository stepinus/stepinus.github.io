import React, { useMemo, useRef } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";
import { EffectComposer, Bloom } from "@react-three/postprocessing";

// Import your assets and utility functions
import sparkTexture from "./spark1.png";
import vertexShader from "./vertex.glsl";
import fragmentShader from "./fragment.glsl";
import createCubePositions from "./createCubePositions";

// Custom hook for creating cube geometry
const useCubeGeometry = (segments, cubeSize, particleSize) => {
  const { particles, lines } = createCubePositions();
  return useMemo(() => {
    const geometry = new THREE.BufferGeometry();

    const {
      particles,
      sizes,
      isPoint: pointIsPoint,
    } = createCubePositions(segments, cubeSize, particleSize);
    const { lines, isPoint: lineIsPoint } = createCubeLines(segments, cubeSize);

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([...particles, ...lines], 3)
    );
    geometry.setAttribute(
      "size",
      new THREE.Float32BufferAttribute(
        [...sizes, ...new Array(lines.length / 3).fill(1)],
        1
      )
    );
    geometry.setAttribute(
      "isPoint",
      new THREE.Float32BufferAttribute([...pointIsPoint, ...lineIsPoint], 1)
    );

    return geometry;
  }, [segments, cubeSize, particleSize]);
};

// Custom shader material
const CubeMaterial = shaderMaterial(
  {
    pointTexture: null,
    time: 0,
    intensity: 0,
    frequency: 0,
    amplitude: 0,
    isDeformActive: false,
    isWaveSizeActive: false,
    waveScale: 0,
    waveSpeed: 0,
    waveSizeScale: 0,
    baseParticleSize: 0,
    baseColor: new THREE.Color(),
    waveColor: new THREE.Color(),
    brightness: 0.8,
  },
  vertexShader,
  fragmentShader
);

extend({ CubeMaterial });

const CubeComponent = ({
  segments = 30,
  cubeSize = 1,
  particleSize = 0.1,
  deformIntensity = 0.5,
  deformFrequency = 1,
  deformAmplitude = 0.2,
  isDeformActive = true,
  isWaveSizeActive = false,
  waveScale = 1,
  waveSpeed = 1,
  waveSizeScale = 1,
  baseColor = [1, 1, 1],
  waveColor = [1, 1, 1],
  brightness = 0.8,
  bloomIntensity = 1.0,
  bloomThreshold = 0.9,
  bloomRadius = 0.5,
}) => {
  const geometry = useCubeGeometry(segments, cubeSize, particleSize);
  const materialRef = useRef();
  const { clock } = useThree();

  const sparkTex = useTexture(sparkTexture);

  useFrame(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = clock.getElapsedTime();
      materialRef.current.uniforms.intensity.value = deformIntensity;
      materialRef.current.uniforms.frequency.value = deformFrequency;
      materialRef.current.uniforms.amplitude.value = deformAmplitude;
      materialRef.current.uniforms.isDeformActive.value = isDeformActive;
      materialRef.current.uniforms.isWaveSizeActive.value = isWaveSizeActive;
      materialRef.current.uniforms.waveScale.value = waveScale;
      materialRef.current.uniforms.waveSpeed.value = waveSpeed;
      materialRef.current.uniforms.waveSizeScale.value = waveSizeScale;
      materialRef.current.uniforms.baseColor.value.setRGB(...baseColor);
      materialRef.current.uniforms.waveColor.value.setRGB(...waveColor);
      materialRef.current.uniforms.brightness.value = brightness;
    }
  });

  return (
    <>
      <points geometry={geometry}>
        <cubeMaterial
          ref={materialRef}
          pointTexture={sparkTex}
          baseParticleSize={particleSize}
        />
      </points>
      <lineSegments geometry={geometry}>
        <cubeMaterial
          ref={materialRef}
          pointTexture={sparkTex}
          baseParticleSize={particleSize}
        />
      </lineSegments>

      <EffectComposer>
        <Bloom
          intensity={bloomIntensity}
          threshold={bloomThreshold}
          radius={bloomRadius}
        />
      </EffectComposer>
    </>
  );
};

export default CubeComponent;
