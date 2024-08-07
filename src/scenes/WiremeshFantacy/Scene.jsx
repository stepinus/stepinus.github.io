import { useState, useRef, useEffect } from "react";
import {
  OrbitControls,
  Cloud,
  Clouds,
  Plane,
  useDepthBuffer,
} from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { innerCube, outerCube } from "./params";
import * as THREE from "three";
import Fog from "./Fog/Fog";
import { useControls } from "leva";
import { Suspense } from "react";
import CameraAnimation from "./CameraAnimation";
import WireCube from "./WireCube/Wirecube2";
import file from "../../assets/Interview.mp3";
import EntryOverlay from "../../utils/EntryOverlay";

const DEFAULT_CAMERA_POSITION = {
  x: 4.4010880234659835,
  y: 4.0303812391399205,
  z: 4.499762925935514,
};

const DEFAULT_CAMERA_ROTATION = {
  x: -0.7304273690283395,
  y: 0.6296342694833126,
  z: 0.4853460110747146,
};

const Scene = () => {
  const { turnOndolly } = useControls("dolly", {
    turnOndolly: { value: false },
  });
  const inner = useControls("innerCube", innerCube);
  const outer = useControls("outerCobe", outerCube);
  const bloom = useControls("bloom", {
    bloomIntensity: { value: 10, min: 0, max: 10, step: 0.1 },
    bloomLuminanceThreshold: { value: 0.45, min: 0, max: 1, step: 0.01 },
    bloomLuminanceSmoothing: { value: 0.02, min: 0, max: 1, step: 0.01 },
    bloomRadius: { value: 0.6, min: 0, max: 1, step: 0.01 },
  });

  const [init, setInit] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundA, setSoundA] = useState();
  const soundRef = useRef(null);
  const [isSoundReady, setIsSoundReady] = useState(false);
  // const depthBuffer = useDepthBuffer({ frames: 1 });
  const [isPlaying, setIsPlaying] = useState(false);
  const audioType = "file";
  // const handleInit = () => {
  //   setInit(true);
  // };
  const toggleSound = () => {
    if (!soundRef.current) return;
    if (isPlaying) {
      soundRef.current.pause();
      setIsListening(false);
    } else {
      soundRef.current.play();
      setIsListening(true);
    }
    setIsPlaying(!isPlaying);
  };
  const initializeSound = () => {
    const listener = new THREE.AudioListener();
    const sound = new THREE.Audio(listener);
    const audioLoader = new THREE.AudioLoader();
    audioLoader.load(file, (buffer) => {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      soundRef.current = sound;
      setSoundA(sound);
      setIsSoundReady(true);
    });
  };
  useEffect(() => {
    initializeSound();
  }, []);
  const stopListening = () => {};
  const switchAudioType = () => {};
  const handleInit = () => {
    console.log("!");
    if (!init) setInit(true);
  };
  const light = useControls("light", {
    position: [3, 10, 4],
    intencity: 3,
    angle: -0.35,
    distance: 6,
    oenumbra: 1,
    anglePower: 4,
  });
  /* 

  "x": 3.5100352763324665,
  "y": 2.72217389643688,
  "z": 0.543095350922062
}
Wirecube2.jsx:191 rotation
Wirecube2.jsx:192 {
  "isEuler": true,
  "_x": -1.3738739305713032,
  "_y": 0.9016754196410163,
  "_z": 1.321722795269892,
  "_order": "XYZ"
}
*/
  // const rotationInRadians = {
  //   x: rotationInDegrees.x * (Math.PI / 180),
  //   y: rotationInDegrees.y * (Math.PI / 180),
  //   z: rotationInDegrees.z * (Math.PI / 180),
  // };
  return (
    <>
      {!init && <EntryOverlay onStart={handleInit} />}
      <Canvas
        shadows
        gl={(canvas) =>
          new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        }
        onCreated={({ camera }) => {
          camera.position.set(
            DEFAULT_CAMERA_POSITION.x,
            DEFAULT_CAMERA_POSITION.y,
            DEFAULT_CAMERA_POSITION.z
          );
          camera.rotation.set(
            DEFAULT_CAMERA_ROTATION.x,
            DEFAULT_CAMERA_ROTATION.y,
            DEFAULT_CAMERA_ROTATION.z
          );
        }}
        camera={{
          fov: 75,
          near: 1,
          far: 100,
        }}
      >
        <Suspense fallback={null}>
          {/* <Perf position="top-left"/> */}
          <EffectComposer disableNormalPass>
            {/* <OrbitControls /> */}
            {/* <pointLight position={[0, 0, 10]} intensity={1.5} /> */}
            <directionalLight {...light} castShadow />
            <directionalLight
              position={[10, 10, 5]}
              intensity={2}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
              shadow-camera-far={50}
              shadow-camera-left={-20}
              shadow-camera-right={20}
              shadow-camera-top={20}
              shadow-camera-bottom={-20}
            />

            <ambientLight intensity={0.5} />
            <WireCube
              settings={outer}
              isOuter
              soundRef={soundRef}
              isListening={isListening}
            />
            {outer.startSound && <Sound url={file} />}
            <WireCube settings={inner} soundRef={soundRef} />
            {/* <Plane
              args={[100, 100, 1, 1]}
              rotation-x={Math.PI / -2}
              position-y="-1"
            >
              <meshStandardMaterial color="red" />
            </Plane> */}
            <mesh receiveShadow position={[0, -2, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[1000, 1000]} setDrawRange={100} />
              <meshPhongMaterial color="black" />
            </mesh>
            <Bloom
              luminanceThreshold={bloom.bloomLuminanceThreshold}
              intensity={bloom.bloomIntensity}
              levels={10}
              mipmapBlur
            />
          </EffectComposer>
        </Suspense>
      </Canvas>

      <div style={{ position: "absolute", top: 10, left: 10 }}>
        <button onClick={toggleSound} disabled={!isSoundReady}>
          Start Listening
        </button>
        <button onClick={stopListening} disabled={!isListening}>
          Stop Listening
        </button>
        <button
          onClick={() => switchAudioType("microphone")}
          disabled={audioType === "microphone"}
        >
          Use Microphone
        </button>
        <button
          onClick={() => switchAudioType("file")}
          disabled={audioType === "file"}
        >
          Use Audio File
        </button>
      </div>
    </>
  );
};

// function MovingSpot({ vec = new Vector3(), ...props }) {
//   const light = useRef();
//   const viewport = useThree((state) => state.viewport);
//   useFrame((state) => {
//     light.current.target.position.lerp(
//       vec.set(
//         (state.mouse.x * viewport.width) / 2,
//         (state.mouse.y * viewport.height) / 2,
//         0
//       ),
//       0.1
//     );
//     light.current.target.updateMatrixWorld();
//   });
//   return (
//     <SpotLight
//       castShadow
//       ref={light}
//       penumbra={1}
//       distance={6}
//       angle={0.35}
//       attenuation={5}
//       anglePower={4}
//       intensity={2}
//       {...props}
//     />
//   );
// }
export default Scene;
