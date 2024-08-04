import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { useControls } from "leva";
import ParticleBox from "./objects/ParticleBox";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { Color } from "three";

function SceneControls({ children }) {
  const fogControls = useControls("FogParticleBox", {
    count: {
      value: 9 * Math.pow(10, 4),
      min: 0,
      max: 9 * Math.pow(10, 6),
      step: 100,
    },
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 2, min: -10, max: 10, step: 0.1 },
    positionZ: { value: 0, min: -10, max: 10, step: 0.1 },
    color: "#ffffff",
    opacity: { value: 0.7, min: 0, max: 1, step: 0.01 },
    size: { value: 0.02, min: 0.001, max: 1, step: 0.005 },
    cubeSize: { value: 10, min: 1, max: 20, step: 0.1 },
    offsetSize: { value: 6, min: 0, max: 10, step: 0.1 },
  });

  const particleControls = useControls("ParticleBox", {
    count: {
      value: 9 * Math.pow(10, 4),
      min: 0,
      max: 9 * Math.pow(10, 7),
      step: 100,
    },
    positionX: { value: 0, min: -10, max: 10, step: 0.1 },
    positionY: { value: 2, min: -10, max: 10, step: 0.1 },
    positionZ: { value: 0, min: -10, max: 10, step: 0.1 },
    color: "#0000FF",
    opacity: { value: 1, min: 0, max: 1, step: 0.01 },
    size: { value: 3, min: 0.001, max: 5, step: 0.005 },
    cubeSize: { value: 6.5, min: 1, max: 20, step: 0.1 },
    glow: { value: 1, min: 0, max: 5, step: 0.1 },
  });
  const bloomControls = useControls("Bloom Effect", {
    intensity: { value: 1, min: 0, max: 2, step: 0.01 },
    threshold: { value: 0.8, min: 0, max: 1, step: 0.01 },
    radius: { value: 0.4, min: 0, max: 1, step: 0.01 },
  });
  return children({
    fogControls,
    particleControls,
    bloomControls,
  });
}

export default function Scene() {
  return (
    <SceneControls>
      {({ fogControls, particleControls, bloomControls }) => (
        <Canvas camera={{ position: [0, 0, 30], fov: 75 }}>
          <color attach="background" args={["#000000"]} />
          {/* <fog attach="fog" args={['#353535', 5, 20]} /> */}
          <ambientLight intensity={0.5} />

          <ParticleBox
            count={fogControls.count}
            position={[
              fogControls.positionX,
              fogControls.positionY,
              fogControls.positionZ,
            ]}
            color={new Color(fogControls.color).toArray()}
            opacity={fogControls.opacity}
            size={fogControls.size}
            cubeSize={fogControls.cubeSize}
            offsetSize={fogControls.offsetSize}
            glowSource={[
              particleControls.positionX,
              particleControls.positionY,
              particleControls.positionZ,
            ]}
            glowColor={particleControls.color}
            glowIntensity={particleControls.glow}
          />
          <ParticleBox
            count={particleControls.count}
            position={[
              particleControls.positionX,
              particleControls.positionY,
              particleControls.positionZ,
            ]}
            color={particleControls.color}
            opacity={particleControls.opacity}
            size={particleControls.size}
            cubeSize={particleControls.cubeSize}
            glow={particleControls.glow}
            fullOpacity
          />
          <OrbitControls />
          <EffectComposer>
            <Bloom
              intensity={bloomControls.intensity}
              threshold={bloomControls.threshold}
              radius={bloomControls.radius}
            />
          </EffectComposer>
        </Canvas>
      )}
    </SceneControls>
  );
}
