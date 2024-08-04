import { useRef, useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const CameraAnimation = ({
  center = [0, 0, 0],
  amplitude,
  speed,
  FOV: fovAmplitude,
  tiltAngle = 70, // Новый проп для угла наклона камеры
}) => {
  const { camera, scene } = useThree();
  const initialPositionRef = useRef(new THREE.Vector3(0, 0, 1)); // Уменьшили расстояние
  const targetPositionRef = useRef(new THREE.Vector3(0, 0, 0));
  const centerRef = useRef(new THREE.Vector3(...center));
  const initialFOV = 75; // Начальное поле зрения
  const fovRef = useRef(initialFOV);

  useEffect(() => {
    camera.position.copy(initialPositionRef.current);
    camera.lookAt(centerRef.current);
    camera.fov = initialFOV;
    camera.updateProjectionMatrix();
  }, [camera]);

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime() * speed;
    const x = Math.sin(t) * amplitude * 1.5; // Усиливаем горизонтальное движение
    const y =
      Math.sin(t * 0.5) * amplitude * 0.3 -
      Math.tan(THREE.MathUtils.degToRad(tiltAngle)); // Уменьшаем вертикальное движение и учитываем наклон
    const z = 10 + Math.cos(t) * amplitude * 0.7; // Немного уменьшаем движение по Z

    targetPositionRef.current.set(x, y, z).add(centerRef.current);

    camera.position.lerp(targetPositionRef.current, 0.05);

    camera.position.lerp(targetPositionRef.current, 0.05);

    // Эффект долли зума
    const newFOV = initialFOV + Math.sin(t) * fovAmplitude * 1.5;
    camera.fov = newFOV;
    camera.updateProjectionMatrix();
  
    camera.lookAt(centerRef.current);
  });

  return null;
};

export default CameraAnimation;
