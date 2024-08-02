import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const ParticleBox = ({
  count = 500000,
  position = [0, 0, 0],
  color = "#ffffff",
  opacity = 0.8,
  size = 0.01,
  cubeSize = 10,
  offsetSize = 0,
  glow = 1,
  glowSource,
  glowColor,
  glowIntensity = 0,
  fullOpacity = true,
}) => {
  const particlesRef = useRef();
  const materialRef = useRef();
  const [key, setKey] = React.useState(0);

  const positions = useMemo(() => {
    console.log(`Recalculating particles. offsetSize: ${offsetSize}`);
    const positions = [];

    const halfOffsetSize = offsetSize / 2;

    let attempts = 0;
    const maxAttempts = count * 2;

    while (positions.length < count * 3 && attempts < maxAttempts) {
      const x = (Math.random() - 0.5) * cubeSize;
      const y = (Math.random() - 0.5) * cubeSize;
      const z = (Math.random() - 0.5) * cubeSize;

      if (
        offsetSize === 0 ||
        Math.abs(x) > halfOffsetSize ||
        Math.abs(y) > halfOffsetSize ||
        Math.abs(z) > halfOffsetSize
      ) {
        positions.push(x, y, z);
      }

      attempts++;
    }

    console.log(`Generated ${positions.length / 3} particles`);
    console.log(`Efficiency: ${(positions.length / 3 / attempts) * 100}%`);

    return new Float32Array(positions);
  }, [count, cubeSize, offsetSize, size]);

  const colors = useMemo(() => {
    const colors = [];
    const particleColor = new THREE.Color(color);
    for (let i = 0; i < positions.length / 3; i++) {
      colors.push(
        particleColor.r,
        particleColor.g,
        particleColor.b,
        fullOpacity ? 1 : opacity
      );
    }
    return new Float32Array(colors);
  }, [positions, color, opacity, fullOpacity]);

  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [colors]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: size },
      uGlow: { value: glow },
      uGlowSource: { value: new THREE.Vector3(...(glowSource || [0, 0, 0])) },
      uGlowColor: { value: new THREE.Color(glowColor || color) },
      uGlowIntensity: { value: glowIntensity },
      uOpacity: { value: fullOpacity ? 1 : opacity }, // Добавляем uniform для opacity
    }),
    [size, glow, glowSource, glowColor, glowIntensity, color, opacity, cubeSize]
  );
  const geometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 4));
    return geometry;
  }, [positions, colors]);

  useFrame((state) => {
    if (particlesRef.current) {
      uniforms.uTime.value = state.clock.elapsedTime;
    }
  });
  useEffect(() => {
    console.log(`offsetSize changed to: ${offsetSize}`);
    setKey((prevKey) => prevKey + 1);
  }, [offsetSize]);

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uSize.value = size;
      materialRef.current.uniforms.uGlow.value = glow;
      materialRef.current.uniforms.uGlowSource.value.set(
        ...(glowSource || [0, 0, 0])
      );
      materialRef.current.uniforms.uGlowColor.value.set(glowColor || color);
      materialRef.current.uniforms.uGlowIntensity.value = glowIntensity;
      materialRef.current.uniforms.uOpacity.value = opacity;
    }
  }, [size, glow, glowSource, glowColor, glowIntensity, color, opacity]);

  useEffect(() => {
    if (materialRef.current) {
      Object.entries(uniforms).forEach(([key, value]) => {
        if (materialRef.current.uniforms[key]) {
          materialRef.current.uniforms[key].value = value.value;
        }
      });
    }
  }, [uniforms]);

  const shaderMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms,
        vertexShader: `
          uniform float uTime;
          uniform float uSize;
          uniform float uGlow;
          uniform vec3 uGlowSource;
          uniform vec3 uGlowColor;
          uniform float uGlowIntensity;
          uniform float uOpacity;
          
          attribute vec4 color;
          varying vec4 vColor;
          varying float vDistance;
          
          void main() {
            vColor = color;
            vColor.a *= uOpacity; 
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
            
            vec3 worldPos = (modelMatrix * vec4(position, 1.0)).xyz;
            vDistance = distance(worldPos, uGlowSource);
            
            gl_PointSize = uSize * (300.0 / -mvPosition.z);
          }
        `,
        fragmentShader: `
          uniform float uGlow;
          uniform vec3 uGlowColor;
          uniform float uGlowIntensity;
          
          varying vec4 vColor;
          varying float vDistance;
          
          void main() {
            float glow = uGlow * (1.0 - smoothstep(0.0, 5.0, vDistance));
            vec3 finalColor = mix(vColor.rgb, uGlowColor, glow * uGlowIntensity);
            gl_FragColor = vec4(finalColor, vColor.a);
          }
        `,
        transparent: fullOpacity ? false : true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [uniforms]
  );
  useEffect(() => {
    if (particlesRef.current) {
      particlesRef.current.geometry.attributes.color.needsUpdate = true;
    }
  }, [colors]);
  return (
    <points ref={particlesRef} position={position} key={key}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 4}
          array={colors}
          itemSize={4}
        />
      </bufferGeometry>
      <primitive object={shaderMaterial} attach="material" ref={materialRef} />
    </points>
  );
};

export default ParticleBox;
