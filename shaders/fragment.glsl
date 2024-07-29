  uniform sampler2D pointTexture;
  varying float vIsPoint;
  
  void main() {
    if (vIsPoint > 0.5) {
      gl_FragColor = texture2D(pointTexture, gl_PointCoord);
      if (gl_FragColor.a < 0.3) discard;
    } else {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 0.5);
    }
  }