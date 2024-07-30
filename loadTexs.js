/* eslint-disable no-prototype-builtins */
import * as THREE from "three";

const texLoader = new THREE.TextureLoader();

export default function(imgs, callback) {
  const length = Object.keys(imgs).length;
  const loadedTexs = {};
  let count = 0;

  for (var key in imgs) {
    const k = key;
    if (imgs.hasOwnProperty(k)) {
      texLoader.load(imgs[k], (tex) => {
        tex.repeat = THREE.RepeatWrapping;
        loadedTexs[k] = tex;
        count++;
        if (count >= length) callback(loadedTexs);
      });
    }
  }
}