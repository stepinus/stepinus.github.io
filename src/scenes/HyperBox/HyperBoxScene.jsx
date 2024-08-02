import React, { useRef, useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useControls } from "leva";
import * as THREE from "three";
import { HyperBox } from "./HyperBox";
import { GPUPoints } from "./GPUPoints";
import { GPGPU } from "./GPGPU";
import NeuralNetwork from "./GeometryBox";

export function Scene() {
  const {
    WIDTH,
    boxOut,
    boxIn,
    limit,
    maxRadius,
    timeSpeed,
    streamSpeed,
    boxHelperVisible,
    GeometryVisible,
    particleCount,
    maxParticleCount,
    particleColor,
    sideLength,
    showMesh,
    maxConnections,
    minDistance,
    spin,
  } = useControls({
    WIDTH: { value: 1000, min: 1000, max: 9000, step: 100 },
    spin: false,
    boxOut: { value: 4, min: 1, max: 10, step: 0.1 },
    boxIn: { value: 2, min: 1, max: 10, step: 0.1 },
    limit: { value: 15, min: 5, max: 30, step: 1 },
    maxRadius: { value: 5, min: 1, max: 10, step: 0.1 },
    timeSpeed: { value: 1, min: 0, max: 2, step: 0.01 },
    streamSpeed: { value: 2, min: 0.5, max: 2, step: 0.01 },
    boxHelperVisible: true,
    GeometryVisible: false,
    maxParticleCount: { value: 1000, max: 15000, step: 100 },
    particleCount: { vakue: 100, max: 1000, min: 2 },
    sideLength: { value: 4, min: 1, max: 10, step: 0.1 },
    maxConnections: { value: 6, min: 1, max: 100, step: 1 },
    minDistance: { value: 2, min: 0.5, step: 0.5, max: 100 },
    vertexpos: { value: 0 },
    colorpos: { value: 0 },
    numConnected: { value: 0 },
    showMesh: true,
  });

  const { gl, scene, camera } = useThree();
  const boxRef = useRef();
  const gpuRef = useRef();
  const pointsRef = useRef();
  const clockRef = useRef(new THREE.Clock());

  // Инициализация HyperBox
  const boxHelper = useMemo(() => {
    return new HyperBox(boxOut, boxIn, 0x007fff, 0xffffff);
  }, [boxOut, boxIn]);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.add(boxHelper);
    }
    return () => {
      if (boxRef.current) {
        boxRef.current.remove(boxHelper);
      }
      // Удаляем вызов boxHelper.dispose();
    };
  }, [boxHelper]);

  // Инициализация GPUPoints
  const points = useMemo(() => {
    const p = new GPUPoints(WIDTH);
    p.material.uniforms.boxOut.value = boxOut;
    p.material.uniforms.boxIn.value = boxIn;
    p.frustumCulled = false;
    return p;
  }, [WIDTH, boxOut, boxIn]);

  useEffect(() => {
    scene.add(points);
    return () => {
      scene.remove(points);
      // Правильная очистка ресурсов GPUPoints
      if (points.geometry) points.geometry.dispose();
      if (points.material) points.material.dispose();
    };
  }, [points, scene]);

  // Инициализация GPGPU
  const gpu = useMemo(() => {
    const g = new GPGPU(WIDTH, WIDTH, gl, maxRadius, limit);
    g.positionVariable.material.uniforms.boxOut.value = boxOut;
    g.positionVariable.material.uniforms.boxIn.value = boxIn;
    return g;
  }, [WIDTH, gl, maxRadius, limit, boxOut, boxIn]);

  useEffect(() => {
    gpuRef.current = gpu;
    return () => {
      if (gpu.dispose) gpu.dispose();
    };
  }, [gpu]);

  const boxMatrixInv = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    const delta = clockRef.current.getDelta() * timeSpeed;
    const rotX = delta * 0.314;
    const rotZ = delta * 0.27;

    if (boxRef.current && gpuRef.current && points) {
      if (spin) {
        boxRef.current.rotation.x += rotX;
        boxRef.current.rotation.z += rotZ;
      }
      boxMatrixInv.copy(boxRef.current.matrixWorld).invert();
      points.material.uniforms.boxMatrixInv.value.copy(boxMatrixInv);

      gpuRef.current.positionVariable.material.uniforms.delta.value =
        delta * streamSpeed;
      gpuRef.current.positionVariable.material.uniforms.rotX.value = rotX;
      gpuRef.current.positionVariable.material.uniforms.rotZ.value = rotZ;
      gpuRef.current.positionVariable.material.uniforms.boxMatrixInv.value.copy(
        boxMatrixInv
      );
      gpuRef.current.compute();

      points.material.uniforms.posTexture.value =
        gpuRef.current.getCurrentRenderTarget(
          gpuRef.current.positionVariable
        ).texture;
    }

    gl.render(scene, camera);
  });

  return (
    <>
      <group ref={boxRef} visible={boxHelperVisible} />
      {GeometryVisible && (
        <NeuralNetwork
          {...{
            maxParticleCount,
            particleCount,
            sideLength,
            maxConnections,
            minDistance,
            showMesh,
          }}
        />
      )}
    </>
  );
}
