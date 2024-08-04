import { OrbitControls, useFBO } from "@react-three/drei";
import { Canvas, useFrame, extend, createPortal } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import { innerCube, outerCube } from "./params";
import * as THREE from "three";
import Wirecube from "./WireCube/Wirecube";

import { useControls } from "leva";

const Scene = () => {
  const cube1 = useControls("innerCube", innerCube);
  const cube2 = useControls("outerCUbe", outerCube);
  return (
    <Canvas camera={{ position: [1.5, 1.5, 2.5] }}>
      <ambientLight intensity={0.5} />
      <Wirecube {...cube1} />
      <Wirecube {...cube2} />
      <OrbitControls />
    </Canvas>
  );
};

export default Scene;
