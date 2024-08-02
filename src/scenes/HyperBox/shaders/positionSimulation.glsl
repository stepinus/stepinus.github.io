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

void main() {
  vec2 uv = gl_FragCoord.xy/resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;

  if(animationMode==0) {
    vec4 boxPos = abs(boxMatrixInv*vec4(position, 1.));
    float maxBoxPos = max(boxPos.x, max(boxPos.y, boxPos.z));
    float hBoxOut = boxOut*0.5;
    float hBoxIn = boxIn*0.5;

    if(maxBoxPos<=hBoxOut) {
      // Движение внутри и вокруг куба
      vec3 toCenter = vec3(0.0)-position;
      float distToCenter = length(toCenter);

      // Определяем ближайшую грань куба
      vec3 absPos = abs(position);
      float maxComp = max(max(absPos.x, absPos.y), absPos.z);
      vec3 normal;
      if(maxComp==absPos.x)
        normal = vec3(sign(position.x), 0.0, 0.0);
      else if(maxComp==absPos.y)
        normal = vec3(0.0, sign(position.y), 0.0);
      else
        normal = vec3(0.0, 0.0, sign(position.z));

      // Вычисляем вектор движения вдоль грани
      vec3 tangent = cross(normal, vec3(0.0, 1.0, 0.0));
      if(length(tangent)<0.01)
        tangent = cross(normal, vec3(1.0, 0.0, 0.0));
      tangent = normalize(tangent);

      // Вычисляем новую позицию
      float speedCoeff = clamp((maxBoxPos-hBoxIn)/(hBoxOut-hBoxIn), 0., 1.);
      speedCoeff = 0.1+speedCoeff*0.9;

      vec3 movement = tangent*delta*tmpPos.w*speedCoeff;

      // Добавляем вращение вокруг центра
      float rotationAngle = delta*0.5; // Уменьшим скорость вращения
      mat4 rotation = rotation3d(normalize(toCenter), rotationAngle);
      vec3 rotatedMovement = (rotation*vec4(movement, 0.0)).xyz;

      // Сглаживаем переход между гранями
      float blendFactor = smoothstep(0.8*hBoxIn, hBoxIn, maxComp)*(1.0-smoothstep(0.8*hBoxOut, hBoxOut, maxComp));
      vec3 smoothMovement = mix(rotatedMovement, movement, blendFactor);

      position += smoothMovement;

      // Применяем вращение куба
      mat4 rotonX = rotation3d(vec3(1, 0, 0),-rotX);
      mat4 rotonZ = rotation3d(vec3(0, 0, 1),-rotZ);
      position = (rotonX*vec4(position, 1.)).xyz;
      position = (rotonZ*vec4(position, 1.)).xyz;
    }

    // Проверка границ (оставляем без изменений)
    float speedCoeff = clamp((maxBoxPos-hBoxIn)/(hBoxOut-hBoxIn), 0., 1.);
    speedCoeff = 0.1+speedCoeff*0.9;
    float x = position.x-(delta*1.*tmpPos.w*speedCoeff);
    float lim = limit;
    if(x<-lim) {
      float diff = mod(abs(-lim-x), lim*2.);
      x = lim-diff;
      position = fromCylindrical(random(position.xy+position.z)*maxRadius, random(position.yz)*3.1415926*2., lim+random(position.zx)*5.).yxz;
      tmpPos.w = random(tmpPos.xw)*0.1+0.9;
    }
    position.x = x;
  } else {
    // Оставляем существующую логику для режима 1 без изменений
    position = calculateNewPosition(position, delta, tmpPos.w);
  }

  gl_FragColor = vec4(position, tmpPos.w);
}