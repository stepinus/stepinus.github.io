export const vertexShader = `
  attribute float size;
  varying float vSize;
  void main() {
    vSize = size;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const fragmentShader = `
  uniform sampler2D pointTexture;
  varying float vSize;
  void main() {
    gl_FragColor = texture2D(pointTexture, gl_PointCoord);
    if (gl_FragColor.a < 0.3) discard;
  }
`;

