import * as THREE from "three";
import windowResizelistener from "./windowResizelistener";
import applyParticleWaveAnimation from "./applyParticleWaveAnimation";
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
        pointTexture: { value: sparkTexture },
        time: { value: 0 },
        intensity: { value: settings.deformIntensity },
        frequency: { value: settings.deformFrequency },
        amplitude: { value: settings.deformAmplitude },
        isDeformActive: { value: settings.isDeformActive },
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

  lineSegments.material.uniforms.intensity.value = settings.deformIntensity;
  lineSegments.material.uniforms.frequency.value = settings.deformFrequency;
  lineSegments.material.uniforms.amplitude.value = settings.deformAmplitude;
  lineSegments.material.uniforms.isDeformActive.value = settings.isDeformActive;
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

  return { scene, camera, renderer, controls, settings, sparkTexture };
};

let particleSystem, lineSegments;

const updateShaderUniforms = (particleSystem, lineSegments, time, settings) => {
  if (particleSystem && particleSystem.material.uniforms) {
    particleSystem.material.uniforms.time.value = time;
    particleSystem.material.uniforms.intensity.value = settings.deformIntensity;
    particleSystem.material.uniforms.frequency.value = settings.deformFrequency;
    particleSystem.material.uniforms.amplitude.value = settings.deformAmplitude;
    particleSystem.material.uniforms.isDeformActive.value =
      settings.isDeformActive;
  }

  if (lineSegments && lineSegments.material.uniforms) {
    lineSegments.material.uniforms.time.value = time;
    lineSegments.material.uniforms.intensity.value = settings.deformIntensity;
    lineSegments.material.uniforms.frequency.value = settings.deformFrequency;
    lineSegments.material.uniforms.amplitude.value = settings.deformAmplitude;
    lineSegments.material.uniforms.isDeformActive.value =
      settings.isDeformActive;
  }
};

const animate = (scene, camera, renderer, controls, settings) => {
  let time = 0;
  let waveTime = 0;

  const animationLoop = () => {
    requestAnimationFrame(animationLoop);

    time += 0.01 * settings.deformSpeed;
    waveTime += 0.02 * settings.waveSpeed;
    if (particleSystem && lineSegments) {
      updateShaderUniforms(particleSystem, lineSegments, time, settings);
      applyParticleWaveAnimation(
        particleSystem,
        waveTime,
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
  };

  animationLoop();
};

const { scene, camera, renderer, controls, settings, sparkTexture } =
  initScene();

// Создание начального куба
updateCube();

// Инициализация анимации
animate(scene, camera, renderer, controls, settings);

// Инициализация GUI
initGui(settings, updateCube, updateParticleSize);

// Добавление слушателя изменения размера окна
windowResizelistener(camera, renderer);
