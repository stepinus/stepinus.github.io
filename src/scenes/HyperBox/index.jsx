import React, { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stats } from "@react-three/drei";
import { Scene } from "./HyperBoxScene";
import * as THREE from "three";

function ThreeScene() {
  return <></>;
}
export default function App() {
  return (
    <>
      <Canvas
        gl={(canvas) =>
          new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        }
        camera={{ position: [-8, 0, -4], fov: 60, near: 1, far: 1000 }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={[0x000000]} />
          <Scene />
          <OrbitControls />
          <Stats />
        </Suspense>
      </Canvas>
    </>
  );
}
