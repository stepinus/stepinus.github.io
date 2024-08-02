import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { extend } from "@react-three/fiber";
import { useSpring } from "@react-spring/three";

// Вершинный шейдер (обновленный)
const vertexShader = /*glsl*/ `
uniform float uTime;
uniform float uSpeed;
uniform float uNoiseDensity;
uniform float uNoiseStrength;
uniform float uFrequency;
uniform float uAmplitude;
uniform vec3 uInnerCubeSize;
uniform float uWindForce;
uniform float uTurbulence;

varying vec3 vPosition;

  //	Simplex 3D Noise 
  //	by Ian McEwan, Ashima Arts
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){ 
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    //  x0 = x0 - 0. + 0.0 * C 
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1. + 3.0 * C.xxx;

    // Permutations
    i = mod(i, 289.0 ); 
    vec4 p = permute( permute( permute( 
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    // Gradients
    // ( N*N points uniformly over a square, mapped onto an octahedron.)
    float n_ = 1.0/7.0; // N=7
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z *ns.z);  //  mod(p,N*N)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vPosition = position;
    
    vec3 pos = position;
    float noiseFreq = uNoiseDensity;
    float noiseAmp = uNoiseStrength; 
    vec3 noisePos = vec3(pos.x * noiseFreq + uTime * uSpeed, pos.y, pos.z);
    pos.x += snoise(noisePos) * noiseAmp;
    pos.y += snoise(noisePos) * noiseAmp;
    pos.z += snoise(noisePos) * noiseAmp;
    
    // Добавляем синусоидальное движение
    pos.x += sin(uFrequency * pos.y + uTime * uSpeed) * uAmplitude;
    pos.y += sin(uFrequency * pos.z + uTime * uSpeed) * uAmplitude;
    pos.z += sin(uFrequency * pos.x + uTime * uSpeed) * uAmplitude;

    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = 2.0;
  }
`;

// Фрагментный шейдер (оставьте как есть)
const fragmentShader = `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying vec3 vPosition;

  void main() {
    gl_FragColor = vec4(uColor, uOpacity);
  }
`;

// Создание материала шейдера (обновленный)
const FogMaterial = shaderMaterial(
  {
    uTime: 0,
    uColor: new THREE.Color(0xffffff),
    uOpacity: 0.8,
    uSpeed: 0.1,
    uNoiseDensity: 0.5,
    uNoiseStrength: 0.2,
    uFrequency: 0.5,
    uAmplitude: 0.1,
  },
  vertexShader,
  fragmentShader
);

extend({ FogMaterial });

function FogParticleBox({
  count = 500000,
  position = [0, 0, 0],
  color = "#ffffff",
  opacity = 0.8,
  size = 0.01,
  cubeSize = 10,
  offsetSize = 0,
  speed = 0.1,
  noiseDensity = 0.5,
  noiseStrength = 0.2,
  frequency = 0.5,
  amplitude = 0.1,
  isAnimating = false,
}) {
  const mesh = useRef();
  const positions = useMemo(() => {
    const baseDensity = count / 1000;
    const adaptiveCount = Math.floor(
      baseDensity * (Math.pow(cubeSize, 3) - Math.pow(offsetSize, 3))
    );
    const positions = new Float32Array(adaptiveCount * 3);

    let i = 0;
    while (i < adaptiveCount) {
      const x = (Math.random() - 0.5) * cubeSize;
      const y = (Math.random() - 0.5) * cubeSize;
      const z = (Math.random() - 0.5) * cubeSize;

      if (
        Math.abs(x) > offsetSize / 2 ||
        Math.abs(y) > offsetSize / 2 ||
        Math.abs(z) > offsetSize / 2
      ) {
        const i3 = i * 3;
        positions[i3] = x;
        positions[i3 + 1] = y;
        positions[i3 + 2] = z;
        i++;
      }
    }

    return positions;
  }, [count, cubeSize, offsetSize]);

  const {
    springSpeed,
    springNoiseDensity,
    springNoiseStrength,
    springFrequency,
    springAmplitude,
  } = useSpring({
    springSpeed: isAnimating ? speed : 0,
    springNoiseDensity: isAnimating ? noiseDensity : 0,
    springNoiseStrength: isAnimating ? noiseStrength : 0,
    springFrequency: isAnimating ? frequency : 0,
    springAmplitude: isAnimating ? amplitude : 0,
    config: { mass: 1, tension: 280, friction: 120 },
  });

  useFrame((state) => {
    if (mesh.current) {
      mesh.current.material.uTime = state.clock.elapsedTime;
      mesh.current.material.uSpeed = springSpeed.get();
      mesh.current.material.uNoiseDensity = springNoiseDensity.get();
      mesh.current.material.uNoiseStrength = springNoiseStrength.get();
      mesh.current.material.uFrequency = springFrequency.get();
      mesh.current.material.uAmplitude = springAmplitude.get();
    }
  });

  if (!positions || positions.length === 0) {
    return null; // или можно вернуть заглушку, например <mesh />
  }

  return (
    <points ref={mesh} position={position}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <fogMaterial
        uColor={new THREE.Color(color)}
        uOpacity={opacity}
        transparent
      />
    </points>
  );
}

export default FogParticleBox;
