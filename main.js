import * as THREE from "three";
import windowResizelistener from "./windowResizelistener";
import spark from "./assets/spark1.png";
import initGui from "./gui";
import vertexShader from "./shaders/vertex.glsl";
import fragmentShader from "./shaders/fragment.glsl";
import {
  createCamera,
  createControls,
  createCubeLines,
  createCubePoints,
  createRenderer,
  createSettings,
} from "./utils";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";

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
  const geometry = new THREE.BufferGeometry();
  const cubeSize = 1;
  const segments = Math.round(settings.segments);

  const {
    particles,
    sizes,
    isPoint: pointIsPoint,
  } = createCubePoints(segments, cubeSize, settings.particleSize);
  const { lines, isPoint: lineIsPoint } = createCubeLines(segments, cubeSize);

  // Объединяем частицы и линии в одну геометрию
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

  if (!particleSystem) {
    // Создаем материал
    const material = new THREE.ShaderMaterial({
      uniforms: {
        // Униформы деформации
        pointTexture: { value: sparkTexture },
        time: { value: 0 },
        intensity: { value: settings.deformIntensity },
        frequency: { value: settings.deformFrequency },
        amplitude: { value: settings.deformAmplitude },
        isDeformActive: { value: settings.isDeformActive },
        // Униформы для анимации размера
        isWaveSizeActive: { value: settings.isWaveSizeActive },
        waveScale: { value: settings.waveScale },
        waveSpeed: { value: settings.waveSpeed },
        waveSizeScale: { value: settings.waveSizeScale },
        baseParticleSize: { value: settings.particleSize },
        //униформы цвета
        baseColor: { value: new THREE.Color(...settings.baseColor) }, // Белый цвет по умолчанию
        waveColor: { value: new THREE.Color(...settings.waveColor) },
        brightness: { value: 0.8 }, // Значение от 0 до 1
      },
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    // Создаем систему частиц и линий
    particleSystem = new THREE.Points(geometry, material);
    lineSegments = new THREE.LineSegments(geometry, material);

    scene.add(particleSystem);
    scene.add(lineSegments);

    ///debug
  } else {
    // Обновляем существующую геометрию
    particleSystem.geometry.dispose();
    particleSystem.geometry = geometry;
    lineSegments.geometry.dispose();
    lineSegments.geometry = geometry;
  }

  // Обновляем униформы шейдера
  particleSystem.material.uniforms.intensity.value = settings.deformIntensity;
  particleSystem.material.uniforms.frequency.value = settings.deformFrequency;
  particleSystem.material.uniforms.amplitude.value = settings.deformAmplitude;
  particleSystem.material.uniforms.isDeformActive.value =
    settings.isDeformActive;
  particleSystem.material.uniforms.brightness.value = settings.brightness;

  lineSegments.material.uniforms.intensity.value = settings.deformIntensity;
  lineSegments.material.uniforms.frequency.value = settings.deformFrequency;
  lineSegments.material.uniforms.amplitude.value = settings.deformAmplitude;
  lineSegments.material.uniforms.isDeformActive.value = settings.isDeformActive;
  lineSegments.material.uniforms.brightness.value = settings.brightness;
}

const initScene = () => {
  const scene = new THREE.Scene();
  const camera = createCamera(window.innerWidth / window.innerHeight);
  const renderer = createRenderer(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = createControls(camera, renderer.domElement, updateCube);

  const settings = createSettings(30, updateCube);

  const textureLoader = new THREE.TextureLoader();
  const sparkTexture = textureLoader.load(spark);
  // Добавляем ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  // Добавляем directional light
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
  // directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  //effects
  // Создаем EffectComposer
  const composer = new EffectComposer(renderer);

  // Добавляем RenderPass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Добавляем UnrealBloomPass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.1, // сила
    0.4, // радиус
    0.85 // порог
  );
  composer.addPass(bloomPass);
  return {
    scene,
    camera,
    renderer,
    controls,
    settings,
    sparkTexture,
    bloomPass,
    composer,
  };
};

let particleSystem, lineSegments;

const updateShaderUniforms = (particleSystem, lineSegments, time, settings) => {
  if (particleSystem && particleSystem.material.uniforms) {
    // Обновления для деформации
    particleSystem.material.uniforms.time.value = time;
    particleSystem.material.uniforms.intensity.value = settings.deformIntensity;
    particleSystem.material.uniforms.frequency.value = settings.deformFrequency;
    particleSystem.material.uniforms.amplitude.value = settings.deformAmplitude;
    particleSystem.material.uniforms.isDeformActive.value =
      settings.isDeformActive;
    // Обновления для анимации размера
    particleSystem.material.uniforms.isWaveSizeActive.value =
      settings.isWaveSizeActive;
    particleSystem.material.uniforms.waveScale.value = settings.waveScale;
    particleSystem.material.uniforms.waveSpeed.value = settings.waveSpeed;
    particleSystem.material.uniforms.waveSizeScale.value =
      settings.waveSizeScale;
    particleSystem.material.uniforms.baseParticleSize.value =
      settings.particleSize;
    particleSystem.material.uniforms.waveColor.value.setRGB(
      ...settings.waveColor
    );
    particleSystem.material.uniforms.baseColor.value.setRGB(
      ...settings.baseColor
    );
  }

  if (lineSegments && lineSegments.material.uniforms) {
    // Обновления для деформации
    lineSegments.material.uniforms.time.value = time;
    lineSegments.material.uniforms.intensity.value = settings.deformIntensity;
    lineSegments.material.uniforms.frequency.value = settings.deformFrequency;
    lineSegments.material.uniforms.amplitude.value = settings.deformAmplitude;
    lineSegments.material.uniforms.isDeformActive.value =
      settings.isDeformActive;
    // Обновления для анимации размера
    lineSegments.material.uniforms.isWaveSizeActive.value =
      settings.isWaveSizeActive;
    lineSegments.material.uniforms.waveScale.value = settings.waveScale;
    lineSegments.material.uniforms.waveSpeed.value = settings.waveSpeed;
    lineSegments.material.uniforms.waveSizeScale.value = settings.waveSizeScale;
    lineSegments.material.uniforms.baseParticleSize.value =
      settings.particleSize;
    lineSegments.material.uniforms.waveColor.value.setRGB(
      ...settings.waveColor
    );
    lineSegments.material.uniforms.baseColor.value.setRGB(
      ...settings.baseColor
    );
  }
};

const animate = (scene, camera, renderer, controls, settings) => {
  let time = 0;
  const animationLoop = () => {
    requestAnimationFrame(animationLoop);
    time += 0.01 * settings.deformSpeed;
    if (particleSystem && lineSegments) {
      updateShaderUniforms(particleSystem, lineSegments, time, settings);

      particleSystem.rotation.x += 0.002;
      particleSystem.rotation.y += 0.002;
      lineSegments.rotation.x += 0.002;
      lineSegments.rotation.y += 0.002;
    }

    controls.update();
    composer.render(scene, camera);
  };

  animationLoop();
};

const {
  scene,
  camera,
  renderer,
  controls,
  settings,
  sparkTexture,
  bloomPass,
  composer,
} = initScene();
const updateBloom = () => {
  if (bloomPass) {
    bloomPass.strength = settings.bloomStrength;
    bloomPass.radius = settings.bloomRadius;
    bloomPass.threshold = settings.bloomThreshold;
  }
};
// Создание начального куба
updateCube();

// Инициализация анимации
animate(scene, camera, renderer, controls, settings, composer);

// Инициализация GUI
initGui(settings, updateCube, updateParticleSize, updateBloom);

// Добавление слушателя изменения размера окна
windowResizelistener(camera, renderer);
