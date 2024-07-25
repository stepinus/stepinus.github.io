precision mediump float;
uniform vec3 u_baseColor;
uniform vec3 u_waveColor;
varying float v_displacement;

void main() {
    vec3 finalColor = mix(u_baseColor, u_waveColor, abs(v_displacement) * 10.0);
    gl_FragColor = vec4(finalColor, 1.0);
}