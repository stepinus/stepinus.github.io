import React, {
    useMemo,
    useRef,
    useEffect,
    useState,
    useCallback,
} from "react";
import {useFrame, useThree, extend} from "@react-three/fiber";
import {shaderMaterial, useTexture} from "@react-three/drei";
import * as THREE from "three";

// Import your assets and utility functions
import sparkTexture from "./spark1.png";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import {createCubeLines, createCubePoints} from "./utils";
import {statusMap, useStore} from "../../../store.js";

// Custom hook for creating cube geometry
const getCubeGeometry = (segments, cubeSize, particleSize, isOuter) => {
    const geometry = new THREE.BufferGeometry();
    const {
        particles,
        sizes,
        isPoint: pointIsPoint,
    } = createCubePoints(segments, cubeSize, particleSize);
    const {lines, isPoint: lineIsPoint} = createCubeLines(segments, cubeSize);

    geometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute([...particles, ...lines], 3)
    );
    geometry.setAttribute(
        "size",
        new THREE.Float32BufferAttribute(
            [...sizes, ...new Array(lines.length / 3).fill(1)],
            1
        )
    );
    geometry.setAttribute(
        "isPoint",
        new THREE.Float32BufferAttribute([...pointIsPoint, ...lineIsPoint], 1)
    );

    return geometry;
};

// Custom shader material
const CubeMaterial = shaderMaterial(
    {
        pointTexture: null,
        time: 0,
        intensity: 0,
        frequency: 0,
        amplitude: 0,
        isDeformActive: false,
        isWaveSizeActive: false,
        waveScale: 0,
        waveSpeed: 0,
        waveSizeScale: 0,
        baseParticleSize: 0,
        baseColor: new THREE.Color(),
        waveColor: new THREE.Color(),
        brightness: 0.8,
        audioIntensity: 0,
        audioBass: 0,
        audioTreble: 0,
        clickAnimation: 0,
    },
    vertexShader,
    fragmentShader
);

extend({CubeMaterial});

const CubeComponent = ({
                           isOuter = false,
                           settings: {
                               segments = 30,
                               scale: cubeSize = 5,
                               particleSize = 0.2,
                               deformIntensity = 0.5,
                               deformFrequency = 1,
                               deformAmplitude = 0.2,
                               isDeformActive = true,
                               isWaveSizeActive = false,
                               waveScale = 2,
                               waveSpeed = 1,
                               waveSizeScale = 1,
                               baseColor = [1, 1, 1],
                               waveColor = [1, 1, 1],
                               brightness = 0.8,
                           },
                       }) => {
    const geometry = useMemo(() => {
        return getCubeGeometry(segments, cubeSize, particleSize);
    }, [segments, cubeSize, particleSize]);

    const materialRef = useRef();
    const materialRef2 = useRef();
    const sparkTex = useTexture(sparkTexture);
    const {clock} = useThree();
    const meshRef = useRef();

    const updateMaterial = (uniforms) => {
        uniforms.intensity.value = deformIntensity;
        uniforms.time.value = clock.getElapsedTime();
        uniforms.frequency.value = deformFrequency;
        uniforms.amplitude.value = deformAmplitude;
        uniforms.isDeformActive.value = isDeformActive;
        uniforms.isWaveSizeActive.value = isWaveSizeActive;
        uniforms.waveScale.value = waveScale;
        uniforms.waveSpeed.value = waveSpeed;
        uniforms.waveSizeScale.value = waveSizeScale;
        uniforms.baseColor.value = new THREE.Color(baseColor);
        uniforms.waveColor.value = new THREE.Color(waveColor);
        uniforms.brightness.value = brightness;
    };

    const updateAudioMaterial = (uniforms) => {
        const status = useStore.getState().status;
        if (!isOuter && status === statusMap.isRecording) {
            const {intensity,treble,bass} = useStore.getState().audioData;
            uniforms.audioIntensity.value = intensity / 2 ;
            uniforms.audioTreble.value =  treble*2;
            uniforms.audioBass.value =  bass*2;
        }
        if (status !== statusMap.isRecording && status !== statusMap.isSpeaking) {
            uniforms.audioIntensity.value = 0;
            uniforms.audioTreble.value =  0;
            uniforms.audioBass.value =  0;
        }
     }
    useFrame((state, delta) => {
        if (materialRef.current) {
            updateMaterial(materialRef.current.uniforms);
            updateAudioMaterial(materialRef.current.uniforms)
        }
        if (materialRef2.current) {
            updateMaterial(materialRef2.current.uniforms);
            updateAudioMaterial(materialRef2.current.uniforms);
        }
    });
    return (
            <group>
                <points geometry={geometry} ref={meshRef}>
                    <cubeMaterial
                        ref={materialRef}
                        pointTexture={sparkTex}
                        baseParticleSize={particleSize}
                    />
                </points>
                <lineSegments geometry={geometry} castShadow>
                    <cubeMaterial
                        ref={materialRef2}
                        pointTexture={sparkTex}
                        baseParticleSize={particleSize}
                    />
                </lineSegments>
            </group>
    );
};

export default CubeComponent;
