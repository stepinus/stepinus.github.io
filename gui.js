import * as dat from "dat.gui";
import { addRuptureControls } from "./rupture";

export default function init(settings, updateCube, updateParticleSize, bloomPass) {
  const gui = new dat.GUI();
  gui.add(settings, "segments", 2, 70, 1).onChange(updateCube);
  gui
    .add(settings, "particleSize", 0.01, 0.5, 0.01)
    .onChange(updateParticleSize);
  gui.add(settings, "updateGeometry");
  gui.add(settings, "deformIntensity", 0, 1, 0.01).name("D_Intensity");
  gui.add(settings, "deformFrequency", 0, 2, 0.01).name("D_Frequency");
  gui.add(settings, "deformAmplitude", 0, 1, 0.01).name("D_Amplitude");
  gui.add(settings, "deformSpeed", 0, 5, 0.1).name("Deform Speed");
  gui.add(settings, "waveScale", 0.1, 2, 0.1).name("Wave Scale");
  gui.add(settings, "waveSpeed", 0, 1, 0.01).name("Wave Speed");
  gui.add(settings, "waveSizeScale", 0, 0.5, 0.01).name("Wave Size Scale");
  const bloomFolder = gui.addFolder('Bloom');
  bloomFolder.add(settings, 'b_strength', 0, 3).name('Strength').onChange(() => {
    bloomPass.strength = settings.b_strength;
  });
  bloomFolder.add(settings, 'b_radius', 0, 1).name('Radius').onChange(() => {
    bloomPass.radius = settings.b_radius;
  });
  bloomFolder.add(settings, 'b_threshold', 0, 1).name('Threshold').onChange(() => {
    bloomPass.threshold = settings.b_threshold;
  });
  const colorWaveFolder = gui.addFolder('Color Wave');
  colorWaveFolder.add(settings, 'colorWaveSpeed', 0.1, 1).name('Speed');
  colorWaveFolder.add(settings, 'colorWaveWidth', 0.01, 0.5).name('Width');
  colorWaveFolder.add(settings, 'colorWaveDirection', { 'Clockwise': 1, 'Counter-clockwise': -1 }).name('Direction');
  colorWaveFolder.open();
  addRuptureControls(gui, settings);
}
