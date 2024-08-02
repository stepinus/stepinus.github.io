import {
  Points,
  BufferGeometry,
  BufferAttribute,
  Matrix4,
  ShaderMaterial
} from "three";
import vertShader from "../../src/shaders/pointsVert.glsl";
import fragShader from "../../src/shaders/pointsFrag.glsl";
class GPUPoints extends Points {
  constructor(WIDTH) {
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
        boxOut: { value: 0 },
        boxIn: { value: 0 },
        posTexture: { value: null },
        boxMatrixInv: { value: new Matrix4() }
      },
      vertexShader: vertShader,
      fragmentShader: fragShader
    });
    super(pg, pm);
    this.frustumCulled = false;
  }
}

export { GPUPoints };
