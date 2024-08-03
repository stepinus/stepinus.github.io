import {
  Points,
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  ShaderMaterial,
  Vector3,
} from "three";
import vertShader from "./shaders/pointsVert.glsl";
import fragShader from "./shaders/pointsFrag.glsl";

import { Point } from "@react-three/drei";
class GPUPoints extends Points {
  constructor(WIDTH, particleOpacity, pointSize = 1) {
    let pg = new BufferGeometry();
    let pos = new Float32Array(WIDTH * WIDTH * 3);
    let refs = new Float32Array(WIDTH * WIDTH * 2);
    for (let i = 0; i < WIDTH * WIDTH; i++) {
      pos.set([0, 0, 0], i * 3);
      let xx = (i % WIDTH) / WIDTH;
      let yy = ~~(i / WIDTH) / WIDTH;
      refs.set([xx, yy], i * 2);
    }
    pg.setAttribute("position", new BufferAttribute(pos, 3));
    console.log("pos: " + pg.attributes.position.count);
    pg.setAttribute("reference", new BufferAttribute(refs, 2));

    let pm = new ShaderMaterial({
      uniforms: {
        boxIn: { value: 3 },
        boxOut: { value: 4 },
        posTexture: { value: null },
        boxMatrixInv: { value: new Matrix4() },
        offset: { value: 1 },
        aColor: { valaue: new Vector3 },
        bColor: { valaue: new Vector3 },
        cColor: { valaue: new Vector3 },
        u_isPlaying: { value: true },
        particleOpacity: { value: particleOpacity },
        pointSize: { value: pointSize },
      },
      vertexShader: vertShader,
      fragmentShader: fragShader,
    });
    super(pg, pm);
    this.frustumCulled = false;
  }
}

export { GPUPoints };
