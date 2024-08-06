import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { shaderMaterial, useTexture } from "@react-three/drei";
import * as THREE from "three";

// Import your assets and utility functions
import sparkTexture from "./spark1.png";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import { createCubeLines, createCubePoints } from "./utils";
import useAudioAnalyzer from "../../../utils/useAudio";

// Custom hook for creating cube geometry
const getCubeGeometry = (segments, cubeSize, particleSize) => {
  const geometry = new THREE.BufferGeometry();

  const {
    particles,
    sizes,
    isPoint: pointIsPoint,
  } = createCubePoints(segments, cubeSize, particleSize);
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
    audioIntensity: 0,
    audioBass: 0,
    audioTreble: 0,
    clickAnimation: 0,
  },
  vertexShader,
  fragmentShader
);

extend({ CubeMaterial });

const CubeComponent = ({
  bloomLayer,
  isListening,
  soundRef,
  settings: {
    segments = 30,
    scale: cubeSize = 5,
    particleSize = 0.2,
    deformIntensity = 0.5,
    deformFrequency = 1,
    deformAmplitude = 0.2,
    isDeformActive = true,
    isWaveSizeActive = false,
    waveScale = 2,
    waveSpeed = 1,
    waveSizeScale = 1,
    baseColor = [1, 1, 1],
    waveColor = [1, 1, 1],
    brightness = 0.8,
    bloomIntensity = 1.0,
    bloomThreshold = 0.9,
    bloomRadius = 0.2,
  },
}) => {
  const geometry = useMemo(() => {
    return getCubeGeometry(segments, cubeSize, particleSize);
  }, [segments, cubeSize, particleSize]);

  const materialRef = useRef();
  const materialRef2 = useRef();
  const sparkTex = useTexture(sparkTexture);
  const { clock } = useThree();
  const analyserRef = useRef();
  const meshRef = useRef();
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.enable(bloomLayer);
    }
  }, [bloomLayer]);

  useEffect(() => {
    if (isListening) {
      console.log("ref");
      analyserRef.current = new THREE.AudioAnalyser(soundRef.current, 32);
    }
    if (soundRef && soundRef.current) {
    }
  }, [isListening]);

  const processAudioData = (data) => {
    if (!data || data.length === 0) {
      console.warn("No audio data available");
      return { bass: 0, treble: 0, intensity: 0 };
    }

    const bass = data.slice(0, 8).reduce((a, b) => a + b, 0) / 8;
    const treble = data.slice(24).reduce((a, b) => a + b, 0) / 8;
    const intensity = data.reduce((a, b) => a + b, 0) / 32;

    console.log("Processed audio data:", { bass, treble, intensity });

    return {
      bass: bass / 255,
      treble: treble / 255,
      intensity: intensity / 255,
    };
  };
  const handleClick = useCallback((e) => {
    e.stopPropagation(); // Останавливаем всплытие события
    if (e.object === meshRef.current) {
      console.log("Клик по кубу!");
      // Здесь можно добавить дополнительную логику
    }
  }, []);

  const updateMaterial = (uniforms) => {
    uniforms.intensity.value = deformIntensity;
    uniforms.time.value = clock.getElapsedTime();
    uniforms.frequency.value = deformFrequency;
    uniforms.amplitude.value = deformAmplitude;
    uniforms.isDeformActive.value = isDeformActive;
    uniforms.isWaveSizeActive.value = isWaveSizeActive;
    uniforms.waveScale.value = waveScale;
    uniforms.waveSpeed.value = waveSpeed;
    uniforms.waveSizeScale.value = waveSizeScale;
    uniforms.baseColor.value = new THREE.Color(baseColor);
    uniforms.waveColor.value = new THREE.Color(waveColor);
    uniforms.brightness.value = brightness;
  };
  useFrame((state, delta) => {
    if (analyserRef.current && materialRef.current) {
      // Убедитесь, что эти значения не равны нулю или очень малы
      const intencity = analyserRef.current.getAverageFrequency() / 255;
      materialRef.current.uniforms.audioIntensity.value = intencity;
      console.log(intencity);
    }

    if (materialRef.current) {
      updateMaterial(materialRef.current.uniforms);
    }
    if (materialRef2.current) {
      updateMaterial(materialRef2.current.uniforms);
    }
  });

  return (
    <mesh>
      <group>
        <points geometry={geometry} ref={meshRef}>
          <cubeMaterial
            ref={materialRef}
            pointTexture={sparkTex}
            baseParticleSize={particleSize}
          />
        </points>
        <lineSegments geometry={geometry}>
          <cubeMaterial
            ref={materialRef2}
            pointTexture={sparkTex}
            baseParticleSize={particleSize}
          />
        </lineSegments>
      </group>
    </mesh>
  );
};

export default CubeComponent;
