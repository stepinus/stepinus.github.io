import {Canvas, useLoader, useThree} from "@react-three/fiber";
import {
    Bloom,
    EffectComposer,
    Noise,
    Vignette,
    SMAA,

} from "@react-three/postprocessing";
import {innerCube, outerCube} from "./params";
import * as THREE from "three";
import {useControls} from "leva";
import {Suspense} from "react";
import WireCube from "./WireCube/Wirecube2";
import {OrbitControls} from "@react-three/drei";


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
    const inner = useControls("innerCube", innerCube);
    const outer = useControls("outerCobe", outerCube);
    const bloom = useControls("bloom", {
        bloomIntensity: {value: 1.7, min: 0, max: 10, step: 0.1},
        bloomLuminanceThreshold: {value: 3, min: 0, max: 5, step: 0.01},
        bloomLuminanceSmoothing: {value: 0.02, min: 0, max: 5, step: 0.01},
        bloomRadius: {value: 0.79, min: 0, max: 5, step: 0.01},
        height: {value: 5, max: 1000, min: 0, step: 5}
    });

    return (

        <Canvas
            shadows
            gl={(canvas) => {
                const renderer = new THREE.WebGLRenderer({
                    canvas,
                    antialias: true,
                    alpha: true,
                    logarithmicDepthBuffer: true
                })
                renderer.outputEncoding = THREE.sRGBEncoding;
                renderer.toneMapping = THREE.LinearToneMapping;
                renderer.toneMappingExposure = 0.5;
                return renderer
            }}
            onCreated={({camera}) => {
                camera.position.set(0, 0, 23);
                camera.rotation.set(0, 0, 0);
            }}
            camera={{
                fov: 75,
                near: 15,
                far: 50,
            }}
        ><OrbitControls/>
            <Suspense fallback={null}>


                <directionalLight
                    color={'#ffffff'}
                    position={[0, -80, 40]}
                    intensity={1}/>
                <ambientLight intensity={0.5} color={'#ffffff'}
                />
                <mesh
                    rotation-y={(-45 * Math.PI) / 180}
                    rotation-x={(30 * Math.PI) / 180}>
                    <WireCube settings={inner}/>
                    <WireCube
                        settings={outer}
                        isOuter
                    />
                </mesh>
                {/*<mesh*/}
                {/*    position={[0, 0, -20]}*/}
                {/*>*/}
                {/*    <planeGeometry args={[1000, 1000]} setDrawRange={100}/>*/}
                {/*    <meshPhongMaterial color="#111111"/>*/}
                {/*</mesh>*/}
                <EffectComposer disableNormalPass>
                    <Bloom
                        luminanceThreshold={bloom.bloomLuminanceThreshold}
                        intensity={bloom.bloomIntensity}
                        bloomRadius={bloom.bloomRadius}
                        levels={10}
                        height={50}
                    />
                    <SMAA
                        preset={2} // Попробуйте значения от 0 до 3
                        edgeDetectionMode={2} // 0: luma, 1: color, 2: depth
                        edgeDetectionThreshold={0.01}/>
                </EffectComposer>
            </Suspense>
        </Canvas>

    );
};


export default Scene;
