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
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import loadTexs from "./loadTexs.js";
import fogImg from "./assets/fog.png";
import Fog from "./fog.js";
const LumaBlurShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.05 },
  },
  vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
  fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform float intensity;
      varying vec2 vUv;
      
      void main() {
        vec4 texel = texture2D(tDiffuse, vUv);
        float luma = dot(texel.rgb, vec3(0.299, 0.587, 0.114));
        vec2 offset = vec2(intensity / 300.0);
        vec4 sum = texel * 0.5;
        sum += texture2D(tDiffuse, vUv + vec2(-offset.x, -offset.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(0.0, -offset.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(offset.x, -offset.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(-offset.x, 0.0)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(offset.x, 0.0)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(-offset.x, offset.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(0.0, offset.y)) * 0.125;
        sum += texture2D(tDiffuse, vUv + vec2(offset.x, offset.y)) * 0.125;
        gl_FragColor = mix(texel, sum, luma * intensity);
      }
    `,
};
const FogBlendShader = {
  uniforms: {
    tDiffuse: { value: null },
    tFog: { value: null },
    fogIntensity: { value: 1.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform sampler2D tFog;
    uniform float fogIntensity;
    varying vec2 vUv;
    
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec4 fogTexel = texture2D(tFog, vUv);
      gl_FragColor = mix(texel, fogTexel, fogTexel.a * fogIntensity);
    }
  `,
};

const clock = new THREE.Clock();

const lumaBlurPass = new ShaderPass(LumaBlurShader);
lumaBlurPass.renderToScreen = true;
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
      transparent: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 1.0,
      color:settings.baseColor
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
  clock.start();

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
  scene.add(directionalLight);

  // Создаем основной RenderPass
  const renderPass = new RenderPass(scene, camera);

  // Настраиваем BloomPass
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.1, // сила
    0.4, // радиус
    0.85 // порог
  );
  const fog = new Fog(renderer);

  // Создаем BloomComposer
  const bloomComposer = new EffectComposer(renderer);
  bloomComposer.addPass(renderPass);
  bloomComposer.addPass(bloomPass);

  // Создаем FinalComposer
  const finalComposer = new EffectComposer(renderer);
  finalComposer.addPass(renderPass);

  // Создаем и добавляем LumaBlurPass
  const lumaBlurPass = new ShaderPass(LumaBlurShader);
  finalComposer.addPass(lumaBlurPass);

  // Создаем FogBlendPass (предполагая, что у вас есть этот шейдер)
  const fogBlendPass = new ShaderPass(FogBlendShader);
  finalComposer.addPass(fogBlendPass);

  // Добавляем OutputPass
  const outputPass = new OutputPass();
  finalComposer.addPass(outputPass);

  return {
    scene,
    camera,
    renderer,
    controls,
    settings,
    sparkTexture,
    bloomPass,
    bloomComposer,
    finalComposer,
    fogBlendPass,
    lumaBlurPass,
    fog,
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
const {
  scene,
  camera,
  renderer,
  controls,
  settings,
  sparkTexture,
  bloomPass,
  composer,
  finalComposer,
  bloomComposer,
  fogBlendPass,
  fog,
} = initScene();
const texsSrc = {
  fog: fogImg,
};

loadTexs(texsSrc, (loadedTexs) => {
  fog.createObj(loadedTexs.fog);
  scene.add(fog.obj);
});
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

    if (fog) {
      fog.render(clock.getDelta());

      // Обновляем текстуру в fogBlendPass
      if (fogBlendPass && fogBlendPass.uniforms.tFog) {
        fogBlendPass.uniforms.tFog.value = fog.uniforms.tex.value;
      }
    }

    // Рендерим сцену с эффектом свечения
    bloomComposer.render();

    // Копируем результат bloomComposer в текстуру для finalComposer
    renderer.setRenderTarget(null);
    finalComposer.passes[0].uniforms.tDiffuse.value =
      bloomComposer.renderTarget2.texture;

    // Выполняем финальный рендеринг
    finalComposer.render();

    controls.update();
  };

  animationLoop();
};

const updateBloom = () => {
  if (bloomPass) {
    bloomPass.strength = settings.bloomStrength;
    bloomPass.radius = settings.bloomRadius;
    bloomPass.threshold = settings.bloomThreshold;
  }
};
initGui(settings, updateCube, updateParticleSize, updateBloom, lumaBlurPass);

// Создание начального куба
updateCube();

// Инициализация анимации
animate(scene, camera, renderer, controls, settings, composer);

// Инициализация GUI

// Добавление слушателя изменения размера окна
windowResizelistener(camera, renderer);
