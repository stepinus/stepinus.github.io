import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/Addons.js";
export const createCamera = (aspect) => {
  const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.z = 5;
  return camera;
};

export const createRenderer = (width, height) => {
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  return renderer;
};

export const createControls = (camera, domElement) => {
  return new OrbitControls(camera, domElement);
};

export const createSettings = (segments, updateCube) => ({
  segments: segments,
  particleSize: 0.05,
  deformIntensity: 0.6,
  deformFrequency: 0.5,
  deformAmplitude: 0.5,
  deformSpeed: 0.5,
  waveScale: 0.8,
  waveSpeed: 0.7,
  waveSizeScale: 0.36,
  colorWaveSpeed: 0.2,
  colorWaveWidth: 0.1,
  colorWaveDirection: 1,
  b_radius: 0.5,
  b_strength: 0.5,
  b_threshold: 0,
  isDeformActive: true,
  updateGeometry: function () {
    updateCube();
  },
});
// Добавьте эти функции после ранее созданных чистых функций

export const createCubePoints = (segments, cubeSize, particleSize) => {
  const particles = [];
  const sizes = [];
  const isPoint = [];

  const addPoint = (x, y, z) => {
    particles.push(x, y, z);
    sizes.push(particleSize);
    isPoint.push(1);
  };

  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = i / segments;
      const v = j / segments;

      // Нижняя грань
      addPoint((u - 0.5) * cubeSize, -0.5 * cubeSize, (v - 0.5) * cubeSize);
      // Верхняя грань
      addPoint((u - 0.5) * cubeSize, 0.5 * cubeSize, (v - 0.5) * cubeSize);
      // Передняя грань
      addPoint((u - 0.5) * cubeSize, (v - 0.5) * cubeSize, -0.5 * cubeSize);
      // Задняя грань
      addPoint((u - 0.5) * cubeSize, (v - 0.5) * cubeSize, 0.5 * cubeSize);
      // Левая грань
      addPoint(-0.5 * cubeSize, (u - 0.5) * cubeSize, (v - 0.5) * cubeSize);
      // Правая грань
      addPoint(0.5 * cubeSize, (u - 0.5) * cubeSize, (v - 0.5) * cubeSize);
    }
  }

  return { particles, sizes, isPoint };
};

export const createCubeLines = (segments, cubeSize) => {
  const lines = [];
  const isPoint = [];

  const addLine = (x1, y1, z1, x2, y2, z2) => {
    lines.push(x1, y1, z1, x2, y2, z2);
    isPoint.push(0, 0);
  };

  for (let i = 0; i <= segments; i++) {
    for (let j = 0; j <= segments; j++) {
      const u = i / segments;
      const v = j / segments;

      if (i < segments) {
        // Горизонтальные линии на гранях
        addLine(
          (u - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (v - 0.5) * cubeSize,
          (u + 1 / segments - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (v - 0.5) * cubeSize
        ); // Нижняя
        addLine(
          (u - 0.5) * cubeSize,
          0.5 * cubeSize,
          (v - 0.5) * cubeSize,
          (u + 1 / segments - 0.5) * cubeSize,
          0.5 * cubeSize,
          (v - 0.5) * cubeSize
        ); // Верхняя
        addLine(
          (u - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (u + 1 / segments - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          -0.5 * cubeSize
        ); // Передняя
        addLine(
          (u - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          0.5 * cubeSize,
          (u + 1 / segments - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          0.5 * cubeSize
        ); // Задняя
      }

      if (j < segments) {
        // Вертикальные линии на гранях
        addLine(
          (u - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (v - 0.5) * cubeSize,
          (u - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (v + 1 / segments - 0.5) * cubeSize
        ); // Нижняя
        addLine(
          (u - 0.5) * cubeSize,
          0.5 * cubeSize,
          (v - 0.5) * cubeSize,
          (u - 0.5) * cubeSize,
          0.5 * cubeSize,
          (v + 1 / segments - 0.5) * cubeSize
        ); // Верхняя
        addLine(
          -0.5 * cubeSize,
          (u - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (u - 0.5) * cubeSize,
          (v + 1 / segments - 0.5) * cubeSize
        ); // Левая
        addLine(
          0.5 * cubeSize,
          (u - 0.5) * cubeSize,
          (v - 0.5) * cubeSize,
          0.5 * cubeSize,
          (u - 0.5) * cubeSize,
          (v + 1 / segments - 0.5) * cubeSize
        ); // Правая
      }

      // Добавляем вертикальные линии только по краям куба
      if (i === 0 || i === segments || j === 0 || j === segments) {
        addLine(
          (u - 0.5) * cubeSize,
          -0.5 * cubeSize,
          (v - 0.5) * cubeSize,
          (u - 0.5) * cubeSize,
          0.5 * cubeSize,
          (v - 0.5) * cubeSize
        );
      }
    }
  }

  return { lines, isPoint };
};
