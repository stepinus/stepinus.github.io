import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import SimulationMaterial from './SimulationMaterial';

import vertexShader from "./VertexShader.glsl";
import fragmentShader from "./FragmentShader.glsl";
import { useControls } from "leva";

extend({ SimulationMaterial: SimulationMaterial });

const cube1 = useControls(innerCubeParams)
const cube2 = useControls(outerCubeParams)

const Scene = () => {
  return (
    <Canvas camera={{ position: [1.5, 1.5, 2.5] }}>
      <ambientLight intensity={0.5} />
      <Wirecube {...cube1}/>
      <Wirecube {...cube2}/>
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
