attribute vec3 position;
attribute vec2 uv;
attribute vec3 instancePosition;
attribute float delay;
attribute float rotate;

uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;
uniform float time;

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vColor;
varying float vBlink;

const float duration = 200.0;

mat4 calcRotateMat4Z(float radian) {
  return mat4(
    cos(radian), -sin(radian), 0.0, 0.0,
    sin(radian), cos(radian), 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0
  );
}
vec3 convertHsvToRgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
#pragma glslify: export(convertHsvToRgb)

void main(void) {
  float now = mod(time + delay * duration, duration) / duration;

  mat4 rotateMat = calcRotateMat4Z(radians(rotate * 360.0) + time * 0.1);
  vec3 rotatePosition = (rotateMat * vec4(position, 1.0)).xyz;

  vec3 moveRise = vec3(
    (now * 2.0 - 1.0) * (2500.0 - (delay * 2.0 - 1.0) * 2000.0),
    (now * 2.0 - 1.0) * 2000.0,
    sin(radians(time * 50.0 + delay + length(position))) * 30.0
    );
  vec3 updatePosition = instancePosition + moveRise + rotatePosition;

  vec3 hsv = vec3(time * 0.1 + delay * 0.2 + length(instancePosition) * 100.0, 0.5 , 0.8);
  vec3 rgb = convertHsvToRgb(hsv);
  float blink = (sin(radians(now * 360.0 * 20.0)) + 1.0) * 0.88;

  // coordinate transformation
  vec4 mvPosition = modelViewMatrix * vec4(updatePosition, 1.0);

  vPosition = position;
  vUv = uv;
  vColor = rgb;
  vBlink = blink;

  gl_Position = projectionMatrix * mvPosition;
}