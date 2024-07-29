import * as dat from "dat.gui";

export default function init(settings, updateCube, updateParticleSize) {
  const gui = new dat.GUI();
  gui.add(settings, "segments", 5, 50).step(1).onChange(updateCube);
  gui.add(settings, "particleSize", 0.01, 0.1).onChange(() => {
    updateParticleSize();
    updateCube();
  });
  gui.add(settings, "updateGeometry");

  gui.add(settings, "deformIntensity", 0, 1, 0.01).name("D_Intensity");
  gui.add(settings, "deformFrequency", 0, 2, 0.01).name("D_Frequency");
  gui.add(settings, "deformAmplitude", 0, 1, 0.01).name("D_Amplitude");
  gui.add(settings, "deformSpeed", 0, 5, 0.1).name("Deform Speed");

  gui.add(settings, "waveScale", 0.1, 2, 0.1).name("Wave Scale");
  gui.add(settings, "waveSpeed", 0, 1, 0.01).name("Wave Speed");
  gui.add(settings, "waveSizeScale", 0, 0.5, 0.01).name("Wave Size Scale");
}
