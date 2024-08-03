import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import positionSimulation from "./shaders/positionSimulation.glsl";

export class GPGPU extends GPUComputationRenderer {
  constructor(
    w,
    h,
    rndr,
    maxRadius,
    limit,
    play,
    particleDensity = 1.0,
    offset
  ) {
    super(w, h, rndr);

    const boxOut = 4;
    const boxIn = 2;

    function fillPositionTexture(texture, boxOutSize, boxInSize, density) {
      const theArray = texture.image.data;
      const totalParticles = theArray.length / 4;
      let particlesPlaced = 0;

      while (particlesPlaced < totalParticles) {
        const x = ((Math.random() * 2 - 1) * boxOutSize) / 2;
        const y = ((Math.random() * 2 - 1) * boxOutSize) / 2;
        const z = ((Math.random() * 2 - 1) * boxOutSize) / 2;

        // Используем плотность для определения, размещать ли частицу
        if (Math.random() < density) {
          const index = particlesPlaced * 4;
          theArray[index + 0] = x;
          theArray[index + 1] = y;
          theArray[index + 2] = z;
          theArray[index + 3] = Math.random() * 0.1 + 0.9; // скорость, как было раньше
          particlesPlaced++;
        }
      }
    }

    let dtPosition = this.createTexture();
    fillPositionTexture(dtPosition, boxOut, boxIn, particleDensity);

    this.positionVariable = this.addVariable(
      "texturePosition",
      positionSimulation,
      dtPosition
    );

    let u = this.positionVariable.material.uniforms;
    u["isPlaying"] = { value: play };
    u["time"] = { value: 0 };
    u["delta"] = { value: 0 };
    u["boxOut"] = { value: boxOut };
    u["boxIn"] = { value: boxIn };
    u["rotX"] = { value: 0 };
    u["rotZ"] = { value: 0 };
    u["limit"] = { value: limit };
    u["maxRadius"] = { value: maxRadius };
    u["boxMatrixInv"] = { value: new THREE.Matrix4() };
    u["offset"] = { value: offset };

    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    this.init();
  }
}
