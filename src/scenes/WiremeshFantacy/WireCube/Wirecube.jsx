import React, { useMemo, useRef, useState, useEffect } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { createCubePoints, createCubeLines } from "./utils";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import sparkTextureFile from "./spark1.png";

const WireCube = ({ settings }) => {
  const pointsRef = useRef();
  const linesRef = useRef();
  const [textureError, setTextureError] = useState(null);

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
    console.log("Creating geometry...");

    const cubeSize = settings.scale;
    const segments = Math.round(settings.segments);

    const {
      particles,
      sizes,
      isPoint: pointIsPoint,
    } = createCubePoints(segments, cubeSize, settings.particleSize);
    const { lines, isPoint: lineIsPoint } = createCubeLines(segments, cubeSize);
    console.log("Particles:", particles.length / 3, "Lines:", lines.length / 3);

    const geometry = new THREE.BufferGeometry();
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
    console.log("Geometry created");

    return geometry;
  }, [settings.segments, settings.particleSize, settings.scale]);
  if (textureError) {
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" />
      </mesh>
    );
  }

  const shaderMaterial = useMemo(() => {
    console.log("Creating shader material...");
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        pointTexture: { value: sparkTexture },
        time: { value: 0 },
        intensity: { value: settings.deformIntensity },
        frequency: { value: settings.deformFrequency },
        amplitude: { value: settings.deformAmplitude },
        isDeformActive: { value: settings.isDeformActive },
        isWaveSizeActive: { value: settings.isWaveSizeActive },
        waveScale: { value: settings.waveScale },
        waveSpeed: { value: settings.waveSpeed },
        waveSizeScale: { value: settings.waveSizeScale },
        baseParticleSize: { value: settings.particleSize },
        baseColor: { value: new THREE.Color(settings.baseColor) },
        waveColor: { value: new THREE.Color(settings.waveColor) },
        brightness: { value: settings.brightness },
      },
      vertexShader,
      fragmentShader,
      transparent: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    console.log("Shader material created");
    return mat
  }, [settings, sparkTexture]);

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
      material.uniforms.waveColor.value.setRGB(settings.waveColor);
      material.uniforms.baseColor.value.setRGB(settings.baseColor);

      linesRef.current.material = material;
    }
  });

  useEffect(() => {
    console.log("WireCube rendered with settings:", settings);
  }, [settings]);

  if (!geometry || !shaderMaterial) {
    console.log("Rendering fallback mesh");
    return (
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="red" wireframe />
      </mesh>
    );
  }

  return (
    <group>
      <points ref={pointsRef} geometry={geometry} material={shaderMaterial} />
      <lineSegments
        ref={linesRef}
        geometry={geometry}
        material={shaderMaterial}
      />
    </group>
  );
};

export default WireCube;
