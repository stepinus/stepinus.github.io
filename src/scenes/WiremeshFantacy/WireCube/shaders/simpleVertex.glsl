attribute float isPoint;
attribute float size;
varying float vIsPoint;

uniform float particleSize;

void main() {
    vIsPoint = isPoint;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    if (isPoint > 0.5) {
        gl_PointSize = size * particleSize;
    }
}
