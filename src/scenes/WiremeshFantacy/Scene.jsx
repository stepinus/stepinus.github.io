import {useState, useRef, useEffect} from "react";

import {
    OrbitControls,
    Cloud,
    Clouds,
    Plane,
    useDepthBuffer,
} from "@react-three/drei";
import {Canvas, useLoader, useThree} from "@react-three/fiber";
import {
    Bloom,
    DepthOfField,
    EffectComposer,
    Noise,
    Vignette,
    SMAA,
} from "@react-three/postprocessing";
import {innerCube, outerCube} from "./params";
import * as THREE from "three";
import Fog from "./Fog/Fog";
import {useControls} from "leva";
import {Suspense} from "react";
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
    const {turnOndolly} = useControls("dolly", {
        turnOndolly: {value: false},
    });
    const inner = useControls("innerCube", innerCube);
    const outer = useControls("outerCobe", outerCube);
    const bloom = useControls("bloom", {
        bloomIntensity: {value: 1.7, min: 0, max: 10, step: 0.1},
        bloomLuminanceThreshold: {value: 3, min: 0, max: 5, step: 0.01},
        bloomLuminanceSmoothing: {value: 0.02, min: 0, max: 5, step: 0.01},
        bloomRadius: {value: 0.79, min: 0, max: 5, step: 0.01},
        height: {value: 5, max: 1000, min: 0, step: 5}
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
    const stopListening = () => {
    };
    const switchAudioType = () => {
    };
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
            {!init && <EntryOverlay onStart={handleInit}/>}
            <Canvas
                shadows
                gl={(canvas) =>
                    new THREE.WebGLRenderer({canvas, antialias: true, alpha: true})
                }
                onCreated={({camera}) => {
                    // camera.position.set(
                    //   DEFAULT_CAMERA_POSITION.x,
                    //   DEFAULT_CAMERA_POSITION.y,
                    //   DEFAULT_CAMERA_POSITION.z
                    // );
                    // camera.rotation.set(
                    //   DEFAULT_CAMERA_ROTATION.x,
                    //   DEFAULT_CAMERA_ROTATION.y,
                    //   DEFAULT_CAMERA_ROTATION.z
                    // );
                    camera.position.set(0, 0, 20);
                    camera.rotation.set(0, 0, 0);
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
                        {/* <DepthOfField
              focusDistance={1}
              focalLength={0.02}
              bokehScale={0.5}
              height={480}
            /> */}
                        {/* <Noise opacity={0.02} /> */}
                        {/* <Vignette eskil={false} offset={0.1} darkness={1.1} /> */}
                        <OrbitControls/>
                        <directionalLight
                            position={[0, -80, 40]}
                            intensity={1}
                            // color={"#aaaaff"}
                            // castShadow
                        />
                        {/* <pointLight position={[0, 5, 20]} intensity={0.5} castShadow />
            <pointLight position={[0, -5, 20]} intensity={0.5} castShadow /> */}

                        {/*<ambientLight intensity={0.5} />*/}
                      <mesh
                            rotation-y={( -25 * Math.PI) / 180}
                            rotation-x={(-10 * Math.PI) / 180}>
                            <WireCube settings={inner} soundRef={soundRef}/>
                            <WireCube
                                settings={outer}
                                isOuter
                                soundRef={soundRef}
                                isListening={isListening}
                            />
                        </mesh>
                        {/* <Plane
              args={[100, 100, 1, 1]}
              rotation-x={Math.PI / -2}
              position-y="-1"
            >
              <meshStandardMaterial color="red" />
            </Plane> */}
                        <mesh
                            position={[0, 0, -20]}
                            // rotation-x={(-90 * Math.PI) / 180}
                            // rotation-y={(45 * Math.PI) / 180}
                            // rotation-x={DEFAULT_CAMERA_ROTATION.x}
                            // rotateX={(-75 * Math.PI) / 180}
                        >
                            <planeGeometry args={[1000, 1000]} setDrawRange={100}/>
                            <meshPhongMaterial color="#111111"/>
                        </mesh>
                        <Bloom
                            luminanceThreshold={bloom.bloomLuminanceThreshold}
                            intensity={bloom.bloomIntensity}
                            bloomRadius={bloom.bloomRadius}
                            levels={10}
                            height={50}
                            Ï/>
                        <SMAA/>
                    </EffectComposer>
                </Suspense>
            </Canvas>

            <div style={{position: "absolute", top: 10, left: 10}}>
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
                <button
                    onClick={() => {
                        console.log(inner);
                        console.log(outer);
                        console.log(bloom);
                    }}
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
