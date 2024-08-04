import React, { useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { createCubeLines, createCubePoints } from "./utils";
import sparkTextureFile from './spark1.png'

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
  const sparkTexture = useLoader(
    THREE.TextureLoader,
    sparkTextureFile,
    undefined,
    (error) => {
      console.error("Error loading texture:", error);
      setTextureError(error);
    }
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
          value: sparkTexture
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

  // useFrame((state) => {
  //   const time = state.clock.getElapsedTime();
  //   material.uniforms.time.value = time * deformSpeed;
  // });

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    if (pointsRef.current && linesRef.current) {
      pointsRef.current.rotation.x += 0.002;
      pointsRef.current.rotation.y += 0.002;
      linesRef.current.rotation.x += 0.002;
      linesRef.current.rotation.y += 0.002;

      const material = pointsRef.current.material;
      material.uniforms.time.value = time;
      material.uniforms.intensity.value = settings.deformIntensity;
      material.uniforms.frequency.value = settings.deformFrequency;
      material.uniforms.amplitude.value = settings.deformAmplitude;
      material.uniforms.isDeformActive.value = settings.isDeformActive;
      material.uniforms.isWaveSizeActive.value = settings.isWaveSizeActive;
      material.uniforms.waveScale.value = settings.waveScale;
      material.uniforms.waveSpeed.value = settings.waveSpeed;
      material.uniforms.waveSizeScale.value = settings.waveSizeScale;
      material.uniforms.baseParticleSize.value = settings.particleSize;
      // material.uniforms.waveColor.value.setRGB(settings.waveColor);
      // material.uniforms.baseColor.value.setRGB(settings.baseColor);

      linesRef.current.material = material;
    }
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
