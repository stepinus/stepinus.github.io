// poinstFrag.glsl
#define ss(a, b, c) smoothstep(a, b, c)
varying vec2 vUv;
varying vec3 vPosition;
varying vec3 vColor;
uniform float boxOut;

void main() {
  float uvLength = length(gl_PointCoord - 0.5);
  if (uvLength > 0.5 ) discard; // make'em round
   float halfBoxOut = boxOut * 0.5;
  if (abs(vPosition.x) > halfBoxOut || abs(vPosition.y) > halfBoxOut || abs(vPosition.z) > halfBoxOut) discard;
  if (abs(vPosition.x) > 20.) discard;
  vec3 col = mix(vColor, vColor * 0.875, ss(0.4, 0.5, uvLength)); // nice stroke
  gl_FragColor = vec4(col, 1);
}