uniform sampler2D pointTexture;
uniform vec3 baseColor;
uniform vec3 waveColor;
uniform float brightness; // Новый uniform для контроля яркости

varying float vIsPoint;
varying float vGradientFactor;
varying vec3 vNormal; // Добавим нормаль для расчета освещения

void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0)); // Направление света
    float diff = max(dot(vNormal, lightDir), 0.0); // Диффузное освещение
    float ambient = 0.3; // Фоновое освещение
    
    if(vIsPoint > 0.5) {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        vec3 color = mix(baseColor, waveColor, vGradientFactor);
        color *= (diff + ambient) * brightness; // Применяем освещение и яркость
        gl_FragColor = vec4(color, texColor.a);
        if(gl_FragColor.a < 0.3)
            discard;
    } else {
        vec3 lineColor = baseColor * (diff + ambient) * brightness; // Применяем освещение и яркость к линиям
        gl_FragColor = vec4(lineColor, 0.5);
    }
}
