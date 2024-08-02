uniform float time;
uniform float delta;
uniform sampler2D texturePosition;
uniform mat4 boxMatrixInv;
uniform float boxOut;
uniform float boxIn;
uniform float rotX;
uniform float rotZ;
uniform float limit;
uniform float maxRadius;

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
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec2 mod289(vec2 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec3 permute(vec3 x) {
  return mod289(((x*34.0)+10.0)*x);
}

float snoise(vec2 v)
  {
  const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                      0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                     -0.577350269189626,  // -1.0 + 2.0 * C.x
                      0.024390243902439); // 1.0 / 41.0
// First corner
  vec2 i  = floor(v + dot(v, C.yy) );
  vec2 x0 = v -   i + dot(i, C.xx);

// Other corners
  vec2 i1;
  //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
  //i1.y = 1.0 - i1.x;
  i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  // x0 = x0 - 0.0 + 0.0 * C.xx ;
  // x1 = x0 - i1 + 1.0 * C.xx ;
  // x2 = x0 - 1.0 + 2.0 * C.xx ;
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;

// Permutations
  i = mod289(i); // Avoid truncation effects in permutation
  vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
		+ i.x + vec3(0.0, i1.x, 1.0 ));

  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m ;
  m = m*m ;

// Gradients: 41 points uniformly over a line, mapped onto a diamond.
// The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;

// Normalise gradients implicitly by scaling m
// Approximation of: m *= inversesqrt( a0*a0 + h*h );
  m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );

// Compute final noise value at P
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
//////////////////////////////////////////////////////////////////////

float random (vec2 st) {
    //return fract(sin(dot(st.xy, vec2(12.9898,78.233)))*43758.5453123);
  return snoise(st);
}

vec3 fromCylindrical( float radius, float theta, float y ) {
  return vec3(radius * sin( theta ), y, radius * cos( theta ));
}

// https://github.com/dmnsgn/glsl-rotate/blob/master/rotation-3d.glsl
mat4 rotation3d(vec3 axis, float angle) {
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat4(
		oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
    oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
    oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
		0.0,                                0.0,                                0.0,                                1.0
	);
}

void main() {
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 tmpPos = texture2D(texturePosition, uv);
  vec3 position = tmpPos.xyz;
  
  vec4 boxPos = abs(boxMatrixInv * vec4(position, 1.));
  float maxBoxPos = max(boxPos.x, max(boxPos.y, boxPos.z));
  float hBoxOut = boxOut * 0.5;
  float hBoxIn = boxIn * 0.5;
  // rotate with the box
  if (maxBoxPos <= hBoxOut){ // if we're in the box - rotate with the box
    mat4 rotonX = rotation3d(vec3(1, 0, 0), -rotX);
    mat4 rotonZ = rotation3d(vec3(0, 0, 1), -rotZ);
    position = (rotonX * vec4(position, 1.)).xyz;
    position = (rotonZ * vec4(position, 1.)).xyz;
  }
    
  float speedCoeff = clamp((maxBoxPos - hBoxIn) / (hBoxOut - hBoxIn), 0., 1.);
  speedCoeff = 0.1 + speedCoeff * 0.9;

  // check the limits
  float x = position.x - (delta * 1. * tmpPos.w * speedCoeff);
  float lim = limit;
  if( x < -lim){
    float diff = mod(abs(-lim - x), lim * 2.);
    x = lim - diff;
    position = fromCylindrical(
      random(position.xy + position.z) * maxRadius,
      random(position.yz) * 3.1415926 * 2.,
      lim + random(position.zx) * 5.
    ).yxz;
    tmpPos.w = random(tmpPos.xw) * 0.1 + 0.9;
  }
  position.x = x;
  gl_FragColor = vec4(position, tmpPos.w);
}