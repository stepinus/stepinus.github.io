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
    // Синий цвет для центра вихря
    vec3 centerColor = vec3(0.02, 0.12, 0.36);
    // Фиолетовый цвет для краев вихря
    vec3 edgeColor = vec3(0.75, 0.78, 0.82);
    // Белый цвет для частиц вне вихря
    vec3 outerColor = vec3(0.73, 0.04, 0.57);

    // Инвертируем t для правильного направления градиента
    float invertedT = 1.0 - t;

    // Создаем градиент от центра к краям вихря
    vec3 vortexColor = mix(centerColor, edgeColor, smoothstep(0.0, 0.6, invertedT));
    // Смешиваем цвет вихря с белым цветом для частиц вне вихря
    return mix(vortexColor, outerColor, smoothstep(0.6, 1.0, invertedT));
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