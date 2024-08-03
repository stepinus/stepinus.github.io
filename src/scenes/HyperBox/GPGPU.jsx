// import * as THREE from "three";
// import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
// import positionSimulation from "./shaders/positionSimulation.glsl";

// export class GPGPU extends GPUComputationRenderer {
//   constructor(w, h, rndr, maxRadius, limit, play) {
//     super(w, h, rndr);

//     let dtPosition = this.createTexture();
//     //console.log(dtPosition)
//     fillPositionTexture(dtPosition);
//     this.positionVariable = this.addVariable(
//       "texturePosition",
//       positionSimulation,
//       dtPosition
//     );
//     let u = this.positionVariable.material.uniforms;
//     u["isPlaying"] = { value: play };
//     u["time"] = { value: 0 };
//     u["delta"] = { value: 0 };
//     u["boxOut"] = { value: 4 };
//     u["boxIn"] = { value: 2 };
//     u["rotX"] = { value: 0 };
//     u["rotZ"] = { value: 0 };
//     u["limit"] = { value: limit };
//     u["maxRadius"] = { value: maxRadius };
//     u["boxMatrixInv"] = { value: new THREE.Matrix4() };
//     u["boxMargin:"] = { value: 0 };

//     this.positionVariable.wrapS = THREE.RepeatWrapping;
//     this.positionVariable.wrapT = THREE.RepeatWrapping;

//     this.init();

//     function fillPositionTexture(texture) {
//       const theArray = texture.image.data;
//       let v = new THREE.Vector3();
//       for (let k = 0, kl = theArray.length; k < kl; k += 4) {
//         v.setFromCylindricalCoords(
//           Math.random(),
//           Math.PI * 2 * Math.random(),
//           Math.random() - 0.5
//         );
//         theArray[k + 0] = v.y * limit * 2 + limit + 5;
//         theArray[k + 1] = v.x * maxRadius;
//         theArray[k + 2] = v.z * maxRadius;
//         theArray[k + 3] = Math.random() * 0.1 + 0.9;
//       }
//     }
//   }
// }
import * as THREE from "three";
import { GPUComputationRenderer } from "three/examples/jsm/misc/GPUComputationRenderer";
import positionSimulation from "./shaders/positionSimulation.glsl";

export class GPGPU extends GPUComputationRenderer {
  constructor(w, h, rndr, maxRadius, limit, play, boxMargin, opacity = 0.5) {
    super(w, h, rndr);

    const boxOut = 4; // Определяем значение boxOut здесь

    function fillPositionTexture(texture, boxSize) {
      const theArray = texture.image.data;

      for (let k = 0, kl = theArray.length; k < kl; k += 4) {
        // Генерируем случайную точку в кубе
        const x = ((Math.random() * 2 - 1) * boxSize) / 2;
        const y = ((Math.random() * 2 - 1) * boxSize) / 2;
        const z = ((Math.random() * 2 - 1) * boxSize) / 2;

        theArray[k + 0] = x;
        theArray[k + 1] = y;
        theArray[k + 2] = z;
        theArray[k + 3] = Math.random() * 0.1 + 0.9; // скорость
      }
    }

    let dtPosition = this.createTexture();
    fillPositionTexture(dtPosition, boxOut);

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
    u["boxIn"] = { value: 2 };
    u["rotX"] = { value: 0 };
    u["rotZ"] = { value: 0 };
    u["limit"] = { value: limit };
    u["maxRadius"] = { value: maxRadius };
    u["boxMatrixInv"] = { value: new THREE.Matrix4() };
    u["boxMargin"] = { value: boxMargin };
    u["opacity"] = { value: opacity };

    this.positionVariable.wrapS = THREE.RepeatWrapping;
    this.positionVariable.wrapT = THREE.RepeatWrapping;

    this.init();
  }
}
