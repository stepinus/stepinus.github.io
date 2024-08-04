import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { innerCube, outerCube } from "./params";
import * as THREE from "three";
import WireCube from "./WireCube/Wirecube2"; // Предполагаем, что это правильное имя компонента
import GeometryBox from "../HyperBox/GeometryBox";
import { useControls } from "leva";
import { Suspense } from "react";

const Scene = () => {
  const cube1 = useControls("innerCube", innerCube);
  const cube2 = useControls("outerCobe", outerCube);
  const mesh = useControls("mesh", {
    maxConnections: { value: 20, min: 1, max: 100, step: 1 },
    maxParticleCount: { value: 200, min: 10, max: 1000, step: 10 },
    sideLength: { value: 20, min: 1, max: 100, step: 1 },
    minDistance: { value: 1, min: 0.1, max: 10, step: 0.1 },
    umConnected: { value: 1, min: 0, max: 1, step: 0.1 },
    meshColor: { value: "#ffffff" },
  });
  const common = useControls("common", { showWire: false });
  const bloom = useControls("bloom", {
    bloomIntensity: { value: 1.5, min: 0, max: 3, step: 0.1 },
    bloomLuminanceThreshold: { value: 0.1, min: 0, max: 1, step: 0.01 },
    bloomLuminanceSmoothing: { value: 0.9, min: 0, max: 1, step: 0.01 },
    bloomRadius: { value: 0.8, min: 0, max: 1, step: 0.01 },
  });
  // const cube2 = useControls("outerCube", outerCube);

  return (
    <Canvas
      gl={(canvas) =>
        new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
      }
      camera={{ position: [0, 0, 10], fov: 60, near: 1, far: 1000 }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        {/* <pointLight position={[10, 10, 10]} intensity={1} /> */}
        {/* <directionalLight position={[5, 5, 5]} intensity={1} /> */}
        <WireCube settings={cube1} />
        <WireCube settings={cube2} />
        {common.showWire && <GeometryBox {...mesh} />}
        <OrbitControls />
        <EffectComposer>
          <Bloom
            {...bloom}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Scene;
