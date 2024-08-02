#define PI 3.1415926

uniform sampler2D posTexture;
uniform mat4 boxMatrixInv;
uniform float boxOut;
uniform float boxIn;

varying vec3 vColor;
varying vec2 vUv;
varying vec3 vPosition;

attribute vec2 reference;

// https://www.shadertoy.com/view/4dsSzr
float square(float s) { return s * s; }
vec3 square(vec3 s) { return s * s; }
vec3 heatmapGradient(float t) {
	return clamp((pow(t, 1.5) * 0.8 + 0.2) * vec3(smoothstep(0.0, 0.35, t) + t * 0.5, smoothstep(0.5, 1.0, t), max(1.0 - t * 1.7, t * 7.0 - 6.0)), 0.0, 1.0);
}
vec3 neonGradient(float t) {
	return clamp(vec3(t * 1.3 + 0.1, square(abs(0.43 - t) * 1.7), (1.0 - t) * 1.7), 0.0, 1.0);
}

void main(){
  vUv = reference;
  vec3 pos = texture(posTexture, reference).rgb;

  float hbOut = boxOut * 0.5;
  float hbIn = boxIn * 0.5;

  vec4 boxPos = abs(boxMatrixInv * vec4(pos, 1.));
  float maxBoxPos = max(boxPos.x, max(boxPos.y, boxPos.z));
  float mixVal = clamp((hbOut - maxBoxPos)/(hbOut - hbIn), 0., 1.);
  //vColor = mix(vec3(0.651, 0.569, 0.314), vec3(1), mixVal);
  vColor = neonGradient(mixVal);

  vPosition = pos;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.);
  
  float sizeAspect = (1. + mixVal * 50.);
  gl_PointSize = (1. * sizeAspect) / (1. - mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}