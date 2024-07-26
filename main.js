import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import createCubePositions from "./createCubePositions";
import windowResizelistener from "./windowResizelistener";
import deformGeometry from "./deformGeometry";
import applyParticleWaveAnimation from "./applyParticleWaveAnimation";
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { vertexShader, fragmentShader } from "./shaders";
import {
  ruptureSettings,
  createRupture,
  updateLines,
} from "./rupture";
import spark from "./assets/spark1.png";
import initGui from "./gui";

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
  b_radius: 0.5,
  b_strength: 0.5,
  b_threshold: 0.,
  ...ruptureSettings,
  updateGeometry: function () {
    updateCube();
  },
};
let composer;
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  settings.b_strength,
  settings.b_radius,
  settings.b_threshold
);

function setupComposer() {
  composer = new EffectComposer(renderer);
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);
  composer.addPass(bloomPass);
}

setupComposer();
initGui(settings, updateCube, updateParticleSize, bloomPass);

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
  originalParticlePositions =
    particleSystem.geometry.attributes.position.array.slice();
  originalLinePositions =
    lineSegments.geometry.attributes.position.array.slice();
}

updateCube();

let time = 0;

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
  //renderer.render(scene, camera);
  composer.render();

}

animate();

windowResizelistener(camera, renderer, composer);
