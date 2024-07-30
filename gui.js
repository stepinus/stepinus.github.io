import * as dat from "dat.gui";

export default function init(
  settings,
  updateCube,
  updateParticleSize,
  updateBloom,
  lumaBlurPass
) {
  const gui = new dat.GUI();
  gui.add(settings, "segments", 5, 50).step(1).onChange(updateCube);
  gui.add(settings, "particleSize", 0.01, 0.1).onChange(() => {
    updateParticleSize();
    updateCube();
  });
  gui.add(settings, "updateGeometry");
  const deformFolder = gui.addFolder("Deformation");
  deformFolder
    .add(settings, "isDeformActive")
    .name("Active")
    .onChange(updateCube);
  deformFolder
    .add(settings, "deformIntensity", 0, 2)
    .name("Intensity")
    .onChange(updateCube);
  deformFolder
    .add(settings, "deformFrequency", 0, 2)
    .name("Frequency")
    .onChange(updateCube);
  deformFolder
    .add(settings, "deformAmplitude", 0, 1)
    .name("Amplitude")
    .onChange(updateCube);
  deformFolder
    .add(settings, "deformSpeed", 0, 2)
    .name("Speed")
    .onChange(updateCube);

  // Папка для настроек анимации размера
  const sizeFolder = gui.addFolder("Size Animation");
  sizeFolder
    .add(settings, "isWaveSizeActive")
    .name("Active")
    .onChange(updateCube);
  sizeFolder
    .add(settings, "waveScale", 0.1, 10)
    .name("Scale")
    .onChange(updateCube);
  sizeFolder
    .add(settings, "waveSpeed", 0.05, 5)
    .name("Speed")
    .onChange(updateCube);
  sizeFolder
    .add(settings, "waveSizeScale", 0.01, 1)
    .name("Size Scale")
    .onChange(updateCube);
  // Общие настройки
  gui
    .addColor(settings, "waveColor")
    .name("Wave Color")
    .onChange(() => {
      updateCube();
    });
  gui
    .addColor(settings, "baseColor")
    .name("Base Color")
    .onChange(() => {
      updateCube();
    });
  const bloomFolder = gui.addFolder("Bloom");
  bloomFolder.add(settings, "bloomStrength", 0, 3).onChange(updateBloom);
  bloomFolder.add(settings, "bloomRadius", 0, 1).onChange(updateBloom);
  bloomFolder.add(settings, "bloomThreshold", 0, 1).onChange(updateBloom);
  gui.add(settings, "brightness", 0.01, 1).onChange(updateCube);
  const lumaBlurFolder = gui.addFolder("Luma Blur");
  lumaBlurFolder.add(settings, "lumaBlurIntensity", 0, 1).onChange((value) => {
    lumaBlurPass.uniforms.intensity.value = Number(value);
  });
}
