import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import createCubePositions from "./createCubePositions";
import windowResizelistener from "./windowResizelistener";
import deformGeometry from "./deformGeometry";
import applyParticleWaveAnimation from "./applyParticleWaveAnimation";
import { vertexShader, fragmentShader } from "./shaders";
import { ruptureSettings, addRuptureControls, createRupture, updateLines } from "./rupture";
import spark from './assets/spark1.png'

let originalParticlePositions, originalLinePositions;
let deformedParticlePositions, deformedLinePositions;
let ruptureCenter = new THREE.Vector3();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.z = 5;

const size = 2;
let segments = 30;

const settings = {
  segments: segments,
  particleSize: 0.05,
  deformIntensity: 0.6,
  deformFrequency: 0.5,
  deformAmplitude: 0.5,
  deformSpeed: 0.5,
  waveScale: 0.8,
  waveSpeed: 0.7,
  waveSizeScale: 0.36,
  ...ruptureSettings,
  updateGeometry: function () {
    updateCube();
  },
};

const gui = new dat.GUI();
gui.add(settings, "segments", 2, 70, 1).onChange(updateCube);
gui.add(settings, "particleSize", 0.01, 0.5, 0.01).onChange(updateParticleSize);
gui.add(settings, "updateGeometry");
gui.add(settings, "deformIntensity", 0, 1, 0.01).name("D_Intensity");
gui.add(settings, "deformFrequency", 0, 2, 0.01).name("D_Frequency");
gui.add(settings, "deformAmplitude", 0, 1, 0.01).name("D_Amplitude");
gui.add(settings, "deformSpeed", 0, 5, 0.1).name("Deform Speed");
gui.add(settings, "waveScale", 0.1, 2, 0.1).name("Wave Scale");
gui.add(settings, "waveSpeed", 0, 1, 0.01).name("Wave Speed");
gui.add(settings, "waveSizeScale", 0, 0.5, 0.01).name("Wave Size Scale");
addRuptureControls(gui, settings);

let particleSystem, lineSegments;

// Загрузка текстуры
const textureLoader = new THREE.TextureLoader();
const sparkTexture = textureLoader.load(spark);

function updateParticleSize() {
  if (particleSystem) {
    const sizes = particleSystem.geometry.attributes.size.array;
    for (let i = 0; i < sizes.length; i++) {
      sizes[i] = settings.particleSize;
    }
    particleSystem.geometry.attributes.size.needsUpdate = true;
  }
}

function updateCube() {
  segments = settings.segments;
  scene.remove(particleSystem);
  scene.remove(lineSegments);

  const { particles, lines } = createCubePositions(size, segments);
 
  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particles, 3)
  );

  const sizes = new Float32Array(particles.length / 3);
  sizes.fill(settings.particleSize);
  particlesGeometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const particlesMaterial = new THREE.ShaderMaterial({
    uniforms: {
      pointTexture: { value: sparkTexture },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);

  const linesGeometry = new THREE.BufferGeometry();
  linesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(lines, 3)
  );

  const linesMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
  });

  lineSegments = new THREE.LineSegments(linesGeometry, linesMaterial);
  scene.add(lineSegments);
  originalParticlePositions = particleSystem.geometry.attributes.position.array.slice();
  originalLinePositions = lineSegments.geometry.attributes.position.array.slice();
}

updateCube();

let time = 0;

let rupturedParticlePoints = new Set();
let rupturedLinePoints = new Set();
function animate() {
  requestAnimationFrame(animate);

  time += 0.01 * settings.deformSpeed;

  if (particleSystem && lineSegments) {
    // Применяем деформацию
    deformedParticlePositions = deformGeometry(
      originalParticlePositions,
      time,
      settings.deformIntensity,
      settings.deformFrequency,
      settings.deformAmplitude
    );
    
    deformedLinePositions = deformGeometry(
      originalLinePositions,
      time,
      settings.deformIntensity,
      settings.deformFrequency,
      settings.deformAmplitude
    );

    // Применяем эффект разрыва
    ruptureCenter.set(settings.ruptureX, settings.ruptureY, settings.ruptureZ);
    const removedParticlePoints = createRupture(
      particleSystem.geometry,
      deformedParticlePositions,
      ruptureCenter,
      settings.ruptureRadius,
      settings.ruptureStrength,
      settings.ruptureRoughness,
      settings.ruptureFrequency
    );
    const removedLinePoints = createRupture(
      lineSegments.geometry,
      deformedLinePositions,
      ruptureCenter,
      settings.ruptureRadius,
      settings.ruptureStrength,
      settings.ruptureRoughness,
      settings.ruptureFrequency
    );
    updateLines(lineSegments.geometry, removedLinePoints);
    // Новая анимация волн (если она все еще нужна)
    applyParticleWaveAnimation(
      particleSystem,
      time,
      settings.waveScale,
      settings.waveSpeed,
      settings.waveSizeScale,
      settings
    );

    particleSystem.rotation.x += 0.002;
    particleSystem.rotation.y += 0.002;
    lineSegments.rotation.x += 0.002;
    lineSegments.rotation.y += 0.002;
  }

  controls.update();
  renderer.render(scene, camera);
}

animate();

windowResizelistener(camera, renderer);
