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
  const common = useControls("common", { showWire: false });
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
        {common.showWire.value && <GeometryBox />}
        <OrbitControls />
        <EffectComposer>
          <Bloom
            intensity={1.5}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Suspense>
    </Canvas>
  );
};

export default Scene;
