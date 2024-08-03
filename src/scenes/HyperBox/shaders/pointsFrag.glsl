// poinstFrag.glsl
#define ss(a, b, c) smoothstep(a, b, c)
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vColor;
uniform float offset;
uniform float particleOpacity;

void main() {
  float uvLength = length(gl_PointCoord - 0.5);
  if (abs(vPosition.y) > offset || abs(vPosition.x) > offset || abs(vPosition.z) > offset) discard;
  // if (abs(vPosition.x) > 20.) discard;
  vec3 col = mix(vColor, vColor * 0.875, ss(0.4, 0.5, uvLength)); // nice stroke
  gl_FragColor = vec4(col, 1);
}