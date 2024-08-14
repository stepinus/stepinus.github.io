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
        isOrbiting: false,
        useAlternativeWave: { value: false },
    },
    vertexShader,
    fragmentShader
);

extend({CubeMaterial});

// Custom hook for creating cube geometry
// Новая функция для создания индексной геометрии куба
const createIndexedCubeGeometry = (segments, cubeSize, particleSize) => {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const indices = [];
    const sizes = [];
    const isPoint = [];

    const segmentSize = cubeSize / segments;

    const addFace = (u, v, w, uDir, vDir, fixed) => {
        const baseIndex = positions.length / 3;
        for (let i = 0; i <= segments; i++) {
            for (let j = 0; j <= segments; j++) {
                const x = fixed.x + uDir.x * i * segmentSize + vDir.x * j * segmentSize;
                const y = fixed.y + uDir.y * i * segmentSize + vDir.y * j * segmentSize;
                const z = fixed.z + uDir.z * i * segmentSize + vDir.z * j * segmentSize;

                positions.push(x, y, z);
                sizes.push(particleSize);
                isPoint.push(1);

                if (i < segments && j < segments) {
                    const index = baseIndex + i * (segments + 1) + j;
                    indices.push(
                        index, index + 1, index + segments + 1,
                        index + segments + 1, index + 1, index + segments + 2
                    );
                }
            }
        }
    };

    // Добавляем грани куба
    const halfSize = cubeSize / 2;
    addFace(1, 0, 0, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(halfSize, -halfSize, -halfSize));
    addFace(1, 0, 0, new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-halfSize, -halfSize, -halfSize));
    addFace(0, 1, 0, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-halfSize, halfSize, -halfSize));
    addFace(0, 1, 0, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0, 1), new THREE.Vector3(-halfSize, -halfSize, -halfSize));
    addFace(0, 0, 1, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-halfSize, -halfSize, halfSize));
    addFace(0, 0, 1, new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(-halfSize, -halfSize, -halfSize));

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));
    geometry.setAttribute('isPoint', new THREE.Float32BufferAttribute(isPoint, 1));
    geometry.setIndex(indices);

    return geometry;
};




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
                               useAlternativeWave=false,
                           },
                       }) => {
    const geometry = useMemo(() => {
        return createIndexedCubeGeometry(segments, cubeSize, particleSize);
    }, [segments, cubeSize, particleSize]);

    const materialRef = useRef();
    const materialRef2 = useRef();
    const sparkTex = useTexture(sparkTexture);
    const {clock} = useThree();
    const meshRef = useRef();

    const updateMaterial = (uniforms) => {
        const status = useStore.getState().status
        uniforms.isOrbiting.value = !isOuter && status === statusMap.isWaitingForResponse;
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
        uniforms.useAlternativeWave.value = !isOuter;
    };

    const updateAudioMaterial = (uniforms) => {
        const status = useStore.getState().status;
        if (!isOuter && status === statusMap.isRecording) {
            const {intensity} = useStore.getState().audioData;
            uniforms.audioIntensity.value = intensity;
        }
        if (status !== statusMap.isRecording && status !== statusMap.isSpeaking) {
            uniforms.audioIntensity.value = 0;
        }
        if(isOuter && status === statusMap.isSpeaking){
            const {intensity} = useStore.getState().audioData;
            uniforms.audioIntensity.value = intensity;
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
                    depthWrite={false}
                />
            </points>
            <lineSegments geometry={geometry} castShadow>
                <cubeMaterial
                    ref={materialRef2}
                    pointTexture={sparkTex}
                    baseParticleSize={particleSize}
                    depthWrite={false}
                />
            </lineSegments>
        </group>
    );
};

export default CubeComponent;
