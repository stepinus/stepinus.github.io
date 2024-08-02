uniform float uTime;
uniform float uSpeed;
uniform float uCurlFreq;
uniform float uNoiseDensity;
uniform float uNoiseStrength;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uOffsetSize;

varying vec3 vPosition;

#pragma glslify: curl = require(glsl-curl-noise2)
#pragma glslify: noise = require(glsl-noise/classic/3d)

void main() {
  vPosition = position;

  // Базовое смещение на основе времени и скорости
  vec3 displaced = position+curl(position*uCurlFreq+uTime*uSpeed)*uNoiseStrength;

  // Добавляем шум для более естественного движения
  displaced += noise(displaced*uNoiseDensity+uTime*uSpeed)*uNoiseStrength;

  // Ограничиваем движение вокруг центрального пространства
  float distFromCenter = length(displaced);
  float minDist = uOffsetSize*0.5;
  if(distFromCenter<minDist) {
    displaced = normalize(displaced)*minDist;
  }

  // Добавляем волнообразное движение
  displaced += sin(displaced*uFrequency+uTime*uSpeed)*uAmplitude;

  gl_Position = projectionMatrix*modelViewMatrix*vec4(displaced, 1.0);
  gl_PointSize = 2.0;
}