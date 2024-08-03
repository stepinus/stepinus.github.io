uniform float time;
uniform float delta;
uniform sampler2D texturePosition;
uniform mat4 boxMatrixInv;
uniform float boxOut;
uniform float boxIn;
uniform float rotX;
uniform float rotZ;
uniform float limit;
uniform float cubeSize;
uniform float maxRadius;
uniform int animationMode; // 0 для старой анимации, 1 для новой
uniform vec3 cloudCenter; // Центр облака частиц

// https://github.com/ashima/webgl-noise/blob/master/src/noise2D.glsl
//////////////////////////////////////////////////////////////////////
//
// Description : Array and textureless GLSL 2D simplex noise function.
//      Author : Ian McEwan, Ashima Arts.
//  Maintainer : stegu
//     Lastmod : 20110822 (ijm)
//     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
//               Distributed under the MIT License. See LICENSE file.
//               https://github.com/ashima/webgl-noise
//               https://github.com/stegu/webgl-noise
// 

vec3 mod289(vec3 x) {
  return x-floor(x*(1.0/289.0))*289.0;
}

vec2 mod289(vec2 x) {
  return x-floor(x*(1.0/289.0))*289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
  0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
  -0.577350269189626,  // -1.0 + 2.0 * C.x
  0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i = floor(v+dot(v, C.yy));
  vec2 x0 = v-i+dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x>x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy+C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute(permute(i.y+vec3(0.0, i1.y, 1.0))+i.x+vec3(0.0, i1.x, 1.0));

  vec3 m = max(0.5-vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m*m;
  m = m*m;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0*fract(p*C.www)-1.0;
  vec3 h = abs(x)-0.5;
  vec3 ox = floor(x+0.5);
  vec3 a0 = x-ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159-0.85373472095314*(a0*a0+h*h);

// Compute final noise value at P
  vec3 g;
  g.x = a0.x*x0.x+h.x*x0.y;
  g.yz = a0.yz*x12.xz+h.yz*x12.yw;
  return 130.0*dot(m, g);
}
//////////////////////////////////////////////////////////////////////

float random(vec2 st) {
    //return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
  return snoise(st);
}

vec3 fromCylindrical(float radius, float theta, float y) {
  return vec3(radius*sin(theta), y, radius*cos(theta));
}

// https://github.com/dmnsgn/glsl-rotate/blob/master/rotation-3d.glsl
mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0-c;

  return mat4(oc*axis.x*axis.x+c, oc*axis.x*axis.y-axis.z*s, oc*axis.z*axis.x+axis.y*s, 0.0, oc*axis.x*axis.y+axis.z*s, oc*axis.y*axis.y+c, oc*axis.y*axis.z-axis.x*s, 0.0, oc*axis.z*axis.x-axis.y*s, oc*axis.y*axis.z+axis.x*s, oc*axis.z*axis.z+c, 0.0, 0.0, 0.0, 0.0, 1.0);
}

vec3 calculateNewPosition(vec3 position, float deltaTime, float speed) {
  vec3 toCloud = cloudCenter-position;
  float distToCloud = length(toCloud);

  if(distToCloud<0.1) {
        // Частица близко к облаку, генерируем новое направление движения
    vec3 randomDir = normalize(vec3(random(position.xy)*2.0-1.0, random(position.yz)*2.0-1.0, random(position.zx)*2.0-1.0));
    return position+randomDir*speed*deltaTime;
  } else if(distToCloud>maxRadius) {
        // Частица слишком далеко, возвращаем к облаку
    return position+normalize(toCloud)*speed*deltaTime;
  } else {
        // Движение вокруг куба
    vec3 axis = cross(position, vec3(0.0, 1.0, 0.0));
    mat4 rotation = rotation3d(normalize(axis), speed*deltaTime);
    return (rotation*vec4(position-cloudCenter, 1.0)).xyz+cloudCenter;
  }
}

// Существующие униформы остаются без изменений

// Новые константы (можно будет заменить на униформы позже)
const float BLACK_HOLE_STRENGTH = 0.1; // Сила эффекта "черной дыры"
const float LAYER_THICKNESS = 0.5; // Толщина каждого слоя в спирали


void main() {
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  float speed = tmpPos.w;

  vec4 boxPos = abs(boxMatrixInv * vec4(position, 1.));
  float maxBoxPos = max(boxPos.x, max(boxPos.y, boxPos.z));
  float hBoxOut = boxOut * 0.5;
  float hBoxIn = boxIn * 0.5;

  // Вычисляем расстояние до центра куба
  vec3 toCenter = vec3(0.0) - position;
  float distToCenter = length(toCenter);

  if (maxBoxPos <= hBoxOut) {
    if (distToCenter > hBoxIn) {
      // Существующая логика движения вокруг куба
      // ... (оставьте существующий код для движения вокруг куба без изменений)
    } else {
      // Новое слоистое спиральное движение
      vec2 spiral = vec2(position.x, position.z);
      float angle = atan(spiral.y, spiral.x);
      float radius = length(spiral);
      
      // Движение к центру
      radius -= delta * BLACK_HOLE_STRENGTH;
      
      // Вращение вокруг центра
      angle += delta * speed * (14.0 - radius / hBoxIn);
      
      // Обновляем позицию
      position.x = radius * cos(angle);
      position.z = radius * sin(angle);
      position.y *= 0.2; // Постепенно уплощаем по оси Y
      
      // Проверяем, должна ли частица быть поглощена
      if (radius < LAYER_THICKNESS) {
        // Перемещаем частицу за пределы куба
        position = fromCylindrical(
          random(position.xy + position.z) * maxRadius,
          random(position.yz) * 3.1415926 * 2.,
          hBoxOut + random(position.zx) * 5.
        ).yxz;
        speed = random(tmpPos.xw) * 0.1 + 0.9;
      }
    }

    // Применяем вращение куба
    mat4 rotonX = rotation3d(vec3(1, 0, 0), -rotX);
    mat4 rotonZ = rotation3d(vec3(0, 0, 1), -rotZ);
    // position = (rotonX * vec4(position, 1.)).xyz;
    // position = (rotonZ * vec4(position, 1.)).xyz;
  }

  // Модифицированное движение по оси X
  float speedCoeff = clamp((maxBoxPos - hBoxIn) / (hBoxOut - hBoxIn), 0., 1.);
  speedCoeff = 0.1 + speedCoeff * 0.9;
  float x = position.x - (delta * 1. * speed * speedCoeff);
  float lim = limit;
  if (x < -lim) {
    float diff = mod(abs(-lim - x), lim * 2.);
    x = lim - diff;
    // Перемещаем частицу за пределы куба
    position = fromCylindrical(
      random(position.xy + position.z) * maxRadius,
      random(position.yz) * 3.1415926 * 2.,
      lim + random(position.zx) * 5.
    ).yxz;
    speed = random(tmpPos.xw) * 0.1 + 0.9;
    
  }
  position.x = x;

  gl_FragColor = vec4(position, speed);
}
