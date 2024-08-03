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
import uiparams from "./params";
import { useControls } from "leva";

export default function Scene() {
  const [params, setParams] = useState(uiparams);

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
    offset,
    aColor,
    bColor,
    cColor,
    meshColor,
    vertexpos,
    coloropos,
    umConnected,
  } = useControls({
    WIDTH: { value: params.WIDTH, min: 1000, max: 9000, step: 100 },
    spin: { value: params.spin },
    boxOut: { value: params.boxOut, min: 1, max: 10, step: 0.1 },
    boxIn: { value: params.boxIn, min: 1, max: 10, step: 0.1 },
    limit: { value: params.limit, min: 5, max: 30, step: 1 },
    maxRadius: { value: params.maxRadius, min: 1, max: 10, step: 0.1 },
    timeSpeed: { value: params.timeSpeed, min: 0, max: 2, step: 0.01 },
    streamSpeed: { value: params.streamSpeed, min: 0.5, max: 2, step: 0.01 },
    boxHelperVisible: { value: params.boxHelperVisible },
    GeometryVisible: { value: params.GeometryVisible },
    maxParticleCount: {
      value: params.maxParticleCount,
      min: 100,
      max: 15000,
      step: 100,
    },
    meshColor: "white",
    particleCount: { value: params.particleCount, min: 2, max: 1000 },
    sideLength: { value: params.sideLength, min: 1, max: 10, step: 0.1 },
    maxConnections: { value: params.maxConnections, min: 1, max: 100, step: 1 },
    showMesh: { value: params.showMesh },
    offset: { value: params.offset, min: 0.1, max: 40, step: 0.5 },
    aColor: [0.02, 0.12, 0.36],
    bColor: [0.75, 0.78, 0.82],
    cColor: [0.73, 0.04, 0.57],
    colorpos: 0,
    umConnected: 0,
  });

  const handleParamsChange = useCallback((newParams) => {
    console.log(newParams);
    setParams(newParams);
  }, []);

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
    p.material.uniforms.offset.value = offset;
    p.material.uniforms.aColor.value = aColor;
    p.material.uniforms.bColor.value = bColor;
    p.material.uniforms.cColor.value = cColor;
    p.frustumCulled = false;
    return p;
  }, [WIDTH, boxOut, boxIn, offset]);

  useEffect(() => {
    scene.add(points);
    return () => {
      scene.remove(points);
      // Правильная очистка ресурсов GPUPoints
      if (points.geometry) points.geometry.dispose();
      if (points.material) points.material.dispose();
    };
  }, [points, scene, ...Object.keys(params)]);

  // Инициализация GPGPU
  const gpu = useMemo(() => {
    const g = new GPGPU(
      WIDTH,
      WIDTH,
      gl,
      maxRadius,
      limit,
      boxIn,
      boxOut,
      offset
    );
    return g;
  }, [WIDTH, gl, maxRadius, limit, boxIn, boxOut, offset]);

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
      <ControlsGUI onParamsChange={handleParamsChange} />
      {showMesh && (
        <NeuralNetwork
          maxConnections={maxConnections}
          maxParticleCount={maxParticleCount}
          sideLength={sideLength}
          minDistance={minDistance}
          vertexpos={vertexpos}
          colorpos={coloropos}
          umConnected={umConnected}
          color={meshColor}
        />
      )}
    </>
  );
}
