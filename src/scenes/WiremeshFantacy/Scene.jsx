import { useState, useRef, useEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { innerCube, outerCube } from "./params";
import * as THREE from "three";
import NeuralNetwork from "../HyperBox/GeometryBox";
import { useControls } from "leva";
import { Suspense } from "react";
import CameraAnimation from "./CameraAnimation";
import WireCube from "./WireCube/Wirecube2";
import file from "../../assets/Interview.mp3";
import EntryOverlay from "../../utils/EntryOverlay";
const Scene = () => {
  const { turnOndolly } = useControls("dolly", {
    turnOndolly: { value: false },
  });
  const inner = useControls("innerCube", innerCube);
  const outer = useControls("outerCobe", outerCube);
  const bloom = useControls("bloom", {
    bloomIntensity: { value: 5.0, min: 0, max: 5, step: 0.1 },
    bloomLuminanceThreshold: { value: 0.02, min: 0, max: 1, step: 0.01 },
    bloomLuminanceSmoothing: { value: 0.03, min: 0, max: 1, step: 0.01 },
    bloomRadius: { value: 0.26, min: 0, max: 1, step: 0.01 },
  });
  const {
    meshColor,
    particleCount,
    sideLength,
    maxConnections,
    showMesh,
    maxParticleCount,
  } = useControls("mesh", {
    meshColor: "white",
    particleCount: { value: 50, min: 2, max: 1000 },
    sideLength: { value: 2, min: 1, max: 10, step: 0.1 },
    minDistance: { value: 1, min: 0.1, max: 10, step: 0.1 },
    maxConnections: {
      value: 1000,
      min: 1,
      max: 100,
      step: 1,
    },
    showMesh: { value: false },
    maxParticleCount: {
      value: 10000,
      min: 100,
      max: 15000,
      step: 100,
    },
  });
  const [init, setInit] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [soundA, setSoundA] = useState();
  const soundRef = useRef(null);
  const [isSoundReady, setIsSoundReady] = useState(false);
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
    console.log('!')
    if (!init) setInit(true);
  };
  return (
    <>
      {!init && <EntryOverlay onStart={handleInit} />}
      <Canvas
        gl={(canvas) =>
          new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true })
        }
        camera={{ near: 1, far: 100 }}
      >
        <Suspense fallback={null}>
          {/* <Perf position="top-left"/> */}
          <EffectComposer disableNormalPass>
            {turnOndolly ? <CameraAnimation /> : <OrbitControls />}
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} intensity={1} />
            <directionalLight position={[5, 5, 5]} intensity={1} />
            <WireCube
              settings={outer}
              isOuter
              soundRef={soundRef}
              isListening={isListening}
            />
            {outer.startSound && <Sound url={file} />}
            <WireCube settings={inner} soundRef={soundRef} />
            <Bloom
              luminanceThreshold={bloom.bloomLuminanceThreshold}
              intensity={bloom.bloomIntensity}
              levels={9}
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

export default Scene;
