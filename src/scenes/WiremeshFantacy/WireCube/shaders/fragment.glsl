uniform sampler2D pointTexture;
uniform vec3 baseColor;
uniform vec3 waveColor;
uniform float brightness;

varying float vIsPoint;
varying float vGradientFactor;
varying vec3 vNormal;

void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;

    if(vIsPoint > 0.5) {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        vec3 color = mix(baseColor, waveColor, vGradientFactor);
        color *= (diff + ambient) * brightness * 2.0; // Увеличили яркость
        gl_FragColor = vec4(color, texColor.a);
        // Добавляем свечение
        gl_FragColor.rgb += color * 0.5;
        if(gl_FragColor.a < 0.1) // Уменьшили порог отбрасывания
            discard;
    } else {
        vec3 lineColor = baseColor * (diff + ambient) * brightness;
        lineColor *= 1.5; // Увеличили яркость линий
        gl_FragColor = vec4(lineColor, 0.7); // Увеличили непрозрачность
        // Добавляем свечение
        gl_FragColor.rgb += lineColor * 0.3;
    }
}
