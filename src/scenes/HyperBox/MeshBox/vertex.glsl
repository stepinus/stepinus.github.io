uniform float time;
uniform float intensity;
uniform float frequency;
uniform float amplitude;
uniform bool isDeformActive;

// Униформы для анимации размера точек
uniform bool isWaveSizeActive;
uniform float waveScale;
uniform float waveSpeed;
uniform float waveSizeScale;
uniform float baseParticleSize;

attribute float size;
attribute float isPoint;

uniform vec3 baseColor;
uniform vec3 waveColor;

varying float vIsPoint;
varying float vGradientFactor;
varying vec3 vNormal;

// Вспомогательные функции для шума Перлина
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

vec3 fade(vec3 t) {
    return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

// Функция шума Перлина
// float cnoise(vec3 P) {
//     vec3 Pi0 = floor(P); // Integer part for indexing
//     vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1
//     Pi0 = mod289(Pi0);
//     Pi1 = mod289(Pi1);
//     vec3 Pf0 = fract(P); // Fractional part for interpolation
//     vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0
//     vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);
//     vec4 iy = vec4(Pi0.yy, Pi1.yy);
//     vec4 iz0 = Pi0.zzzz;
//     vec4 iz1 = Pi1.zzzz;

//     vec4 ixy = permute(permute(ix) + iy);
//     vec4 ixy0 = permute(ixy + iz0);
//     vec4 ixy1 = permute(ixy + iz1);

//     vec4 gx0 = ixy0 * (1.0 / 7.0);
//     vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
//     gx0 = fract(gx0);
//     vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
//     vec4 sz0 = step(gz0, vec4(0.0));
//     gx0 -= sz0 * (step(0.0, gx0) - 0.5);
//     gy0 -= sz0 * (step(0.0, gy0) - 0.5);

//     vec4 gx1 = ixy1 * (1.0 / 7.0);
//     vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
//     gx1 = fract(gx1);
//     vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
//     vec4 sz1 = step(gz1, vec4(0.0));
//     gx1 -= sz1 * (step(0.0, gx1) - 0.5);
//     gy1 -= sz1 * (step(0.0, gy1) - 0.5);

//     vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
//     vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
//     vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
//     vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
//     vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
//     vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
//     vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
//     vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

//     vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g100, g100), dot(g010, g010), dot(g110, g110)));
//     g000 *= norm0.x;
//     g100 *= norm0.y;
//     g010 *= norm0.z;
//     g110 *= norm0.w;
//     vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g101, g101), dot(g011, g011), dot(g111, g111)));
//     g001 *= norm1.x;
//     g101 *= norm1.y;
//     g011 *= norm1.z;
//     g111 *= norm1.w;

//     float n000 = dot(g000, Pf0);
//     float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));
//     float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));
//     float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));
//     float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));
//     float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));
//     float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));
//     float n111 = dot(g111, Pf1);

//     vec3 fade_xyz = fade(Pf0);
//     vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);
//     vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);
//     float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);
//     return 2.2 * n_xyz;
// }
#include cnoise

// Отдельная функция шума для анимации размера
float sizeNoise(vec3 p) {
    return cnoise(p);
}

// Функция для вычисления размера точки на основе шума
float calculatePointSize(vec3 position) {
    float waveTime = time * waveSpeed;
    float noiseValue = sizeNoise(vec3(position.x * waveScale + waveTime, position.y * waveScale + waveTime, position.z * waveScale + waveTime));

    return (noiseValue + 1.0) * 0.5 * waveSizeScale + baseParticleSize;
}


void main() {
    vIsPoint = isPoint;
    vNormal = normalMatrix * normal;
    vec3 newPosition = position;

    // Применяем деформацию на основе шума, если она активна
    if (isDeformActive) {
        float noiseValue = cnoise(vec3(position.x * frequency + time, position.y * frequency + time, position.z * frequency + time));
        vec3 deformation = vec3(noiseValue) * sin(time * 2.0) * amplitude * intensity;
        newPosition += deformation;
    }

    vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
    gl_Position = projectionMatrix * mvPosition;

    // Устанавливаем размер точки и вычисляем градиент, если это точка
    if (isPoint > 0.5) {
        if (isWaveSizeActive) {
            float waveTime = time * waveSpeed;

            // Уменьшаем масштаб волны для более редкого появления
            float adjustedWaveScale = waveScale * 0.2;

            vec3 noisePosition = vec3(position.x * adjustedWaveScale + waveTime,
            position.y * adjustedWaveScale + waveTime,
            position.z * adjustedWaveScale + waveTime);

            // Основной шум для определения размера волны
            float noiseValue = sizeNoise(noisePosition);

            // Дополнительный шум для определения области волны
            float waveAreaNoise = sizeNoise(noisePosition * 0.5 + 1000.0);

            // Используем пороговое значение для определения, где будут волны
            float waveThreshold = 0.7;
            float wavePresence = step(waveThreshold, waveAreaNoise);

            // Создаем более резкий переход для волны
            float waveFactor = smoothstep(0.3, 0.7, noiseValue) * wavePresence;

            // Дополнительно уменьшаем количество волн, используя модульную арифметику
            float moduloFactor = step(0.8, fract(noiseValue * 2.0));
            waveFactor *= moduloFactor;

            float finalPointSize = mix(baseParticleSize, baseParticleSize + waveSizeScale, waveFactor);

            gl_PointSize = finalPointSize * (300.0 / -mvPosition.z);

            vSizeFactor = waveFactor;
            vGradientFactor = waveFactor;
        } else {
            gl_PointSize = size * (300.0 / -mvPosition.z);
            vGradientFactor = 0.0;
        }
    } else {
        vGradientFactor = 0.0;
    }
}