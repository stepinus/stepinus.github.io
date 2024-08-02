import "./styles.css";

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { GUI } from "three/examples/jsm/libs/dat.gui.module.js";

import { HyperBox } from "../src/js/HyperBox";
import { GPUPoints } from "../src/js/GPUPoints";
import { GPGPU } from "../src/js/GPGPU";

let app = document.getElementById("app");

let params = {
  WIDTH: 2000, // will give 4M points
  boxOut: 5,
  boxIn: 3,
  limit: 15,
  maxRadius: 4.4,
  timeSpeed: 1,
  streamSpeed: 1
};

let scene = new THREE.Scene();
scene.background = new THREE.Color(0x400040);
let camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  1,
  1000
);
camera.position.set(-8, 0, -4).setLength(9);
let renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
app.appendChild(renderer.domElement);

let stats = new Stats();
app.appendChild(stats.dom);

let controls = new OrbitControls(camera, renderer.domElement);
controls.update();

let grid = new THREE.GridHelper(10, 2);
grid.rotation.z = Math.PI * 0.5;
//scene.add(grid);

// hyperbox
let boxHelper = new HyperBox(params.boxOut, params.boxIn, 0x007fff, 0xffffff);
let box = new THREE.Group();
box.add(boxHelper);
scene.add(box);

let WIDTH = params.WIDTH;

// points
let p = new GPUPoints(WIDTH);
p.material.uniforms.boxOut.value = params.boxOut;
p.material.uniforms.boxIn.value = params.boxIn;
p.frustumCulled = false;
scene.add(p);

// gpgpu
let gpu = new GPGPU(WIDTH, WIDTH, renderer, params.maxRadius, params.limit);
gpu.positionVariable.material.uniforms.boxOut.value = params.boxOut;
gpu.positionVariable.material.uniforms.boxIn.value = params.boxIn;

// GUI
let gui = new GUI();
gui.add(params, "timeSpeed", 0, 2);
gui.add(params, "streamSpeed", 0.5, 2);
gui.add(boxHelper, "visible").name("box helper");

let clock = new THREE.Clock();

window.addEventListener("resize", onResize);
window.addEventListener("keydown", onKeyDown);

let boxMatrixInv = new THREE.Matrix4();

renderer.setAnimationLoop(() => {
  let delta = clock.getDelta() * params.timeSpeed;

  let rotX = delta * 0.314;
  let rotZ = delta * 0.27;

  box.rotation.x += rotX;
  box.rotation.z += rotZ;

  boxMatrixInv.copy(box.matrixWorld).invert();
  p.material.uniforms.boxMatrixInv.value.copy(boxMatrixInv);

  gpu.positionVariable.material.uniforms.delta.value =
    delta * params.streamSpeed;
  gpu.positionVariable.material.uniforms.rotX.value = rotX;
  gpu.positionVariable.material.uniforms.rotZ.value = rotZ;
  gpu.positionVariable.material.uniforms.boxMatrixInv.value.copy(boxMatrixInv);
  gpu.compute();

  p.material.uniforms.posTexture.value = gpu.getCurrentRenderTarget(
    gpu.positionVariable
  ).texture;

  renderer.render(scene, camera);
  stats.update();
});

function onKeyDown(event) {
  if (event.keyCode === 83) {
    let statVis = stats.domElement.style.display;
    let guiVis = gui.domElement.style.display;
    stats.domElement.style.display = statVis === "none" ? "" : "none";
    gui.domElement.style.display = guiVis === "none" ? "" : "none";
  }
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
