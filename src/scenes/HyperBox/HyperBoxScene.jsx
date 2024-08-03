import React, {
  useRef,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { HyperBox } from "./HyperBox";
import { GPUPoints } from "./GPUPoints";
import { GPGPU } from "./GPGPU";
import NeuralNetwork from "./GeometryBox";
import ControlsGUI from "./ControlsGUI";

export default function Scene() {
  const [params, setParams] = useState({
    WIDTH: 4000,
    spin: false,
    boxOut: 4,
    boxIn: 2,
    limit: 15,
    maxRadius: 5,
    timeSpeed: 1,
    streamSpeed: 2,
    boxHelperVisible: true,
    GeometryVisible: false,
    maxParticleCount: 1000,
    particleCount: 100,
    sideLength: 4,
    maxConnections: 6,
    minDistance: 2,
    showMesh: true,
  });

  const handleParamsChange = useCallback((newParams) => {
    setParams(newParams);
  }, []);

  const { gl, scene, camera } = useThree();
  const boxRef = useRef();
  const gpuRef = useRef();
  const pointsRef = useRef();
  const clockRef = useRef(new THREE.Clock());

  // Инициализация HyperBox
  const boxHelper = useMemo(() => {
    return new HyperBox(params.boxOut, params.boxIn, 0x007fff, 0xffffff);
  }, [params.boxOut, params.boxIn]);

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
    const p = new GPUPoints(params.WIDTH);
    p.material.uniforms.boxOut.value = params.boxOut;
    p.material.uniforms.boxIn.value = params.boxIn;
    p.frustumCulled = false;
    return p;
  }, [params.WIDTH, params.boxOut, params.boxIn]);

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
    const g = new GPGPU(
      params.WIDTH,
      params.WIDTH,
      gl,
      params.maxRadius,
      params.limit,
      params.boxIn,
      params.boxOut
    );
    return g;
  }, [
    params.WIDTH,
    gl,
    params.maxRadius,
    params.limit,
    params.boxIn,
    params.boxOut,
  ]);

  useEffect(() => {
    gpuRef.current = gpu;
    return () => {
      if (gpu.dispose) gpu.dispose();
    };
  }, [gpu]);

  const boxMatrixInv = useMemo(() => new THREE.Matrix4(), []);

  useFrame(() => {
    const delta = clockRef.current.getDelta() * params.timeSpeed;
    const rotX = delta * 0.314;
    const rotZ = delta * 0.27;

    if (boxRef.current && gpuRef.current && points) {
      // if (spin) {
      //   boxRef.current.rotation.x += rotX;
      //   boxRef.current.rotation.z += rotZ;
      // }
      boxMatrixInv.copy(boxRef.current.matrixWorld).invert();
      points.material.uniforms.boxMatrixInv.value.copy(boxMatrixInv);

      gpuRef.current.positionVariable.material.uniforms.delta.value =
        delta * params.streamSpeed;
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
      <group ref={boxRef} visible={params.boxHelperVisible} />
      <ControlsGUI onParamsChange={handleParamsChange} />
    </>
  );
}
