import React, { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Vector3 } from "three";
import { Box } from "@react-three/drei"; // Добавляем импорт Box

function NeuralNetwork({
  maxConnections = 50,
  maxParticleCount = 1000,
  sideLength = 4,
  particleCount = 100,
  minDistance = 4,
  color = '#ffffff',
  colorpos=0,
  vertexpos=0,
  numConnected=0
}) {
  const groupRef = useRef();
  const particlesRef = useRef();
  const linesGeometryRef = useRef();

  let  halfSide = sideLength / 2;




  const segments = maxParticleCount * maxParticleCount;
  const positions = useMemo(() => new Float32Array(segments * 3), [segments]);
  const colors = useMemo(() => new Float32Array(segments * 3), [segments]);
  const particlePositions = useMemo(
    () => new Float32Array(maxParticleCount * 3),
    []
  );

  const particlesData = useMemo(() => [], []);

  const v = useMemo(() => new Vector3(), []);

  useEffect(() => {
    for (let i = 0; i < maxParticleCount; i++) {
      // Generate positions within a cube
      const x = Math.random() * sideLength - halfSide;
      const y = Math.random() * sideLength - halfSide;
      const z = Math.random() * sideLength - halfSide;

      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      const v = new Vector3(
        -1 + Math.random() * 2,
        -1 + Math.random() * 2,
        -1 + Math.random() * 2
      );
      particlesData.push({
        velocity: v.normalize().divideScalar(50),
        numConnections: 0,
      });
    }

    particlesRef.current.setDrawRange(0, particleCount);
  }, []);

  useFrame((_, delta) => {
    vertexpos = 0;
    colorpos = 0;
    numConnected = 0;

    for (let i = 0; i < particleCount; i++) particlesData[i].numConnections = 0;

    for (let i = 0; i < particleCount; i++) {
      const particleData = particlesData[i];

      v.set(
        particlePositions[i * 3],
        particlePositions[i * 3 + 1],
        particlePositions[i * 3 + 2]
      ).add(particleData.velocity);

      // Boundary checking for a cube
      if (v.x < -halfSide || v.x > halfSide) particleData.velocity.x *= -1;
      if (v.y < -halfSide || v.y > halfSide) particleData.velocity.y *= -1;
      if (v.z < -halfSide || v.z > halfSide) particleData.velocity.z *= -1;

      particlePositions[i * 3] = v.x;
      particlePositions[i * 3 + 1] = v.y;
      particlePositions[i * 3 + 2] = v.z;

      if (particleData.numConnections >= maxConnections) continue;

      for (let j = i + 1; j < particleCount; j++) {
        const particleDataB = particlesData[j];
        if (particleDataB.numConnections >= maxConnections) continue;

        const dx = particlePositions[i * 3] - particlePositions[j * 3];
        const dy = particlePositions[i * 3 + 1] - particlePositions[j * 3 + 1];
        const dz = particlePositions[i * 3 + 2] - particlePositions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

        if (dist < minDistance) {
          particleData.numConnections++;
          particleDataB.numConnections++;

          const alpha = 1.0 - dist / minDistance;

          positions[vertexpos++] = particlePositions[i * 3];
          positions[vertexpos++] = particlePositions[i * 3 + 1];
          positions[vertexpos++] = particlePositions[i * 3 + 2];

          positions[vertexpos++] = particlePositions[j * 3];
          positions[vertexpos++] = particlePositions[j * 3 + 1];
          positions[vertexpos++] = particlePositions[j * 3 + 2];

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;
          colors[colorpos++] = alpha;

          numConnected++;
        }
      }
    }
    if (linesGeometryRef.current && particlesRef.current) {
      linesGeometryRef.current.setDrawRange(0, numConnected * 2);
      linesGeometryRef.current.attributes.position.needsUpdate = true;
      linesGeometryRef.current.attributes.color.needsUpdate = true;

      particlesRef.current.attributes.position.needsUpdate = true;

      // groupRef.current.rotation.y += delta / 5;
    }
  });

  return (
    <group ref={groupRef} dispose={null}>
      <Box args={[sideLength, sideLength, sideLength]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color={color}
          wireframe={true}
          transparent={true}
          opacity={1.0}
        />
      </Box>
      <points>
        <bufferGeometry ref={particlesRef}>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          color={"white"}
          size={0}
          blending={AdditiveBlending}
          transparent={true}
          sizeAttenuation={false}
        />
      </points>
      <lineSegments>
        <bufferGeometry ref={linesGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            count={positions.length / 3}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={colors.length / 3}
            array={colors}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          vertexColors={true}
          blending={AdditiveBlending}
          transparent={true}
        />
      </lineSegments>
    </group>
  );
}

export default NeuralNetwork;
