import * as THREE from "three";
import { GUI } from "dat.gui";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass";
import { Cube } from "./cube.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";

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

const lumaBlurPass = new ShaderPass(LumaBlurShader);
lumaBlurPass.renderToScreen = true;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const params = {
  threshold: 0.5,
  strength: 0.5,
  radius: 0.8,
  segments: 20,
  audioSource: "file",
  lumaBlurIntensity: 0.05,
};

renderer.outputColorSpace = THREE.SRGBColorSpace;

const renderScene = new RenderPass(scene, camera);

const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight)
);
bloomPass.threshold = params.threshold;
bloomPass.strength = params.strength;
bloomPass.radius = params.radius;

const bloomComposer = new EffectComposer(renderer);
bloomComposer.addPass(renderScene);
bloomComposer.addPass(bloomPass);

const outputPass = new OutputPass();
bloomComposer.addPass(outputPass);
bloomComposer.addPass(lumaBlurPass);

camera.position.set(0, -2, 14);
camera.lookAt(0, 0, 0);

// Create Cube instance
const cube = new Cube(scene, params.segments);

// Add lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Enable shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
directionalLight.castShadow = true;

// Audio setup
const audioStatus = document.getElementById("audioStatus");
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);

const audioLoader = new THREE.AudioLoader();
function updateAudioStatus(status) {
  audioStatus.textContent = "Audio Status: " + status;
}

audioLoader.load(
  "./assets/Beats.mp3",
  function (buffer) {
    sound.setBuffer(buffer);
    updateAudioStatus("File loaded. Click to play!");
    audioStatus.style.backgroundColor = "rgba(0, 128, 0, 0.7)";
    audioStatus.addEventListener("click", function () {
      if (params.audioSource === "file") {
        if (!sound.isPlaying) {
          sound.play();
          updateAudioStatus("playing file, click for pause");
        } else {
          sound.pause();
          updateAudioStatus("File paused. Click to resume.");
        }
      }
    });
  },
  function (xhr) {
    audioStatus.textContent = `Audio Status: Loading... ${Math.round(
      (xhr.loaded / xhr.total) * 100
    )}%`;
  },
  function (err) {
    console.error("An error occurred while loading audio:", err);
    audioStatus.textContent = "Audio Status: Error loading audio";
    audioStatus.style.backgroundColor = "rgba(255, 0, 0, 0.7)";
  }
);

let currentAnalyser;
let microphone;
let microphoneAnalyser;

function setupMicrophone() {
  return navigator.mediaDevices
    .getUserMedia({ audio: true, video: false })
    .then(function (stream) {
      microphone = new THREE.Audio(listener);
      microphone.setMediaStreamSource(stream);
      microphoneAnalyser = new THREE.AudioAnalyser(microphone, 32);
      return microphoneAnalyser;
    })
    .catch(function (err) {
      console.error("Ошибка при получении доступа к микрофону:", err);
    });
}

const analyser = new THREE.AudioAnalyser(sound, 32);
currentAnalyser = analyser;

// GUI setup
const gui = new GUI();
const colorFolder = gui.addFolder("Colors");
colorFolder.addColor(cube.uniforms.u_baseColor, "value").name("Base Color");
colorFolder.addColor(cube.uniforms.u_waveColor, "value").name("Wave Color");
colorFolder
  .add(cube.uniforms.u_frequency, "value", 0, 30)
  .name("Wave Intensity");

const bloomFolder = gui.addFolder("Bloom");
bloomFolder.add(params, "threshold", 0, 1).onChange((value) => {
  bloomPass.threshold = Number(value);
});
bloomFolder.add(params, "strength", 0, 3).onChange((value) => {
  bloomPass.strength = Number(value);
});
bloomFolder.add(params, "radius", 0, 1).onChange((value) => {
  bloomPass.radius = Number(value);
});

const geometryFolder = gui.addFolder("Geometry");
geometryFolder.add(params, "segments", 10, 200).onChange((value) => {
  cube.updateGeometry(value);
});
const lumaBlurFolder = gui.addFolder("Luma Blur");
lumaBlurFolder.add(params, "lumaBlurIntensity", 0, 1).onChange((value) => {
  lumaBlurPass.uniforms.intensity.value = Number(value);
});
const audioFolder = gui.addFolder("Audio");
audioFolder
  .add(params, "audioSource", ["file", "microphone"])
  .name("Audio Source")
  .onChange(function (value) {
    if (value === "file") {
      currentAnalyser = analyser;
      if (microphone) {
        microphone.disconnect();
      }
      if (!sound.isPlaying) {
        updateAudioStatus("File loaded. Click here to play!");
      } else {
        updateAudioStatus("playing file, click for pause");
      }
    } else {
      if (sound.isPlaying) {
        sound.stop();
      }
      setupMicrophone().then(function (micAnalyser) {
        currentAnalyser = micAnalyser;
        updateAudioStatus("Using microphone");
      });
    }
  });

let mouseX = 0;
let mouseY = 0;
document.addEventListener("mousemove", (e) => {
  let windowHalfX = window.innerWidth / 2;
  let windowHalfY = window.innerHeight / 2;
  mouseX = (e.clientX - windowHalfX) / 100;
  mouseY = (e.clientY - windowHalfY) / 100;
});

const clock = new THREE.Clock();

function animate() {
  camera.position.x += (mouseX - camera.position.x) * 0.05;
  camera.position.y += (-mouseY - camera.position.y) * 0.5;
  camera.lookAt(scene.position);
  cube.update(clock.getElapsedTime(), currentAnalyser.getAverageFrequency());

  bloomComposer.render();
  requestAnimationFrame(animate);
}

animate();

window.addEventListener("resize", function () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  bloomComposer.setSize(window.innerWidth, window.innerHeight);
});
