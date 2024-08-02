import {
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  Vector3
} from "three";

class HyperBox extends LineSegments {
  constructor(outerSize, innerSize, outerColor, innerColor) {
    let basePts = [
      // outer
      [1, 1, 1],
      [-1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
      [1, -1, 1],
      [-1, -1, 1],
      [-1, -1, -1],
      [1, -1, -1],
      // inner
      [1, 1, 1],
      [-1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
      [1, -1, 1],
      [-1, -1, 1],
      [-1, -1, -1],
      [1, -1, -1]
    ];

    let pts = basePts.map((p) => {
      return new Vector3(p[0], p[1], p[2]);
    });
    let g = new BufferGeometry().setFromPoints(pts);
    g.setAttribute(
      "outin",
      new BufferAttribute(
        new Float32Array([0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1]),
        1
      )
    );
    let m = new LineBasicMaterial({ vertexColors: true });

    g.setIndex([
      0,
      1,
      1,
      2,
      2,
      3,
      3,
      0,
      4,
      5,
      5,
      6,
      6,
      7,
      7,
      4,
      0,
      4,
      1,
      5,
      2,
      6,
      3,
      7,

      8,
      9,
      9,
      10,
      10,
      11,
      11,
      8,
      12,
      13,
      13,
      14,
      14,
      15,
      15,
      12,
      8,
      12,
      9,
      13,
      10,
      14,
      11,
      15,

      0,
      8,
      1,
      9,
      2,
      10,
      3,
      11,
      4,
      12,
      5,
      13,
      6,
      14,
      7,
      15
    ]);

    super(g, m);
    this.outerSize = { value: outerSize };
    this.innerSize = { value: innerSize };
    this.outerColor = { value: new Color(outerColor) };
    this.innerColor = { value: new Color(innerColor) };
    m.onBeforeCompile = (shader) => {
      shader.uniforms.outerSize = this.outerSize;
      shader.uniforms.innerSize = this.innerSize;
      shader.uniforms.outerColor = this.outerColor;
      shader.uniforms.innerColor = this.innerColor;
      shader.vertexShader = `
        uniform float outerSize;
        uniform float innerSize;
        uniform vec3 outerColor;
        uniform vec3 innerColor;
        attribute float outin;
        ${shader.vertexShader}
      `
        .replace(
          `#include <color_vertex>`,
          `#include <color_vertex>
          vColor = mix(outerColor, innerColor, floor(outin + 0.1));
        `
        )
        .replace(
          `#include <begin_vertex>`,
          `#include <begin_vertex>
          float diff = outerSize - innerSize;
          transformed *= 0.5 * (outerSize - diff * floor(outin + 0.1));
        `
        );
      //console.log(shader.vertexShader);
    };
  }
}

export { HyperBox };
