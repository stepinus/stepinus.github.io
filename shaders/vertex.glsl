  uniform float time;
  uniform float intensity;
  uniform float frequency;
  uniform float amplitude;
  uniform bool isDeformActive;
  
  attribute float size;
  attribute float isPoint;

  
  varying float vIsPoint;

  vec3 mod289(vec3 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 mod289(vec4 x)
  {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
  }

  vec4 permute(vec4 x)
  {
    return mod289(((x*34.0)+1.0)*x);
  }

  vec4 taylorInvSqrt(vec4 r)
  {
    return 1.79284291400159 - 0.85373472095314 * r;
  }

  vec3 fade(vec3 t) {
    return t*t*t*(t*(t*6.0-15.0)+10.0);
  }

  // Classic Perlin noise
#include cnoise

   void main() {
    vIsPoint = isPoint;
    vec3 newPosition = position;
    
    if (isDeformActive) {
      float noiseValue = cnoise(vec3(
        position.x * frequency + time,
        position.y * frequency + time,
        position.z * frequency + time
      ));
      
      vec3 deformation = vec3(noiseValue, noiseValue, noiseValue) * sin(time * 2.0) * amplitude * intensity;
      
      newPosition += deformation;
    }
    
    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    
    gl_Position = projectionMatrix * mvPosition;
    
    if (isPoint > 0.5) {
      gl_PointSize = size * (300.0 / -mvPosition.z);
    }
  }