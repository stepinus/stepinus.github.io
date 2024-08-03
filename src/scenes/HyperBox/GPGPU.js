import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import positionSimulation from "./shaders/positionSimulation.glsl";

export class GPGPU extends GPUComputationRenderer {
  constructor(w, h, rndr, maxRadius, limit, boxIn, boxOut) {
    super(w, h, rndr);

    let dtPosition = this.createTexture();
    fillPositionTexture(dtPosition, boxIn, boxOut);
    this.positionVariable = this.addVariable(
      "texturePosition",
      positionSimulation,
      dtPosition
    );
    let u = this.positionVariable.material.uniforms;
    u["time"] = { value: 0 };
    u["delta"] = { value: 0 };
    u["boxOut"] = { value: boxOut };
    u["boxIn"] = { value: boxIn };
    u["rotX"] = { value: 0 };
    u["rotZ"] = { value: 0 };
    u["limit"] = { value: limit };
    u["maxRadius"] = { value: maxRadius };
    u["boxMatrixInv"] = { value: new THREE.Matrix4() };
    u["boxMargin"] = { value: 0 };

    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    this.init();

    function fillPositionTexture(texture, boxIn, boxOut) {
      const theArray = texture.image.data;
      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        let x, y, z;
        do {
          x = (Math.random() - 0.5) * boxOut * 2;
          y = (Math.random() - 0.5) * boxOut * 2;
          z = (Math.random() - 0.5) * boxOut * 2;
        } while (
          Math.abs(x) <= boxIn &&
          Math.abs(y) <= boxIn &&
          Math.abs(z) <= boxIn
        );

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = Math.random() * 0.1 + 0.9; // Оставляем оригинальное значение для альфа-канала
      }
    }
  }
}
