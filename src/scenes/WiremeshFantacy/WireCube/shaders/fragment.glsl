uniform sampler2D pointTexture;
uniform vec3 baseColor;
uniform vec3 waveColor;
uniform float brightness;

varying float vIsPoint;
varying float vGradientFactor;
varying vec3 vNormal;
varying float vDeformationFactor;
varying float vSizeFactor;
varying float vDisplacement;

void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;

    if(vIsPoint > 0.5) {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);
        
        // Смешиваем цвета на основе деформации и размера
        vec3 color = mix(baseColor, waveColor, max(abs(vDisplacement) * 10.0, vSizeFactor));
        
        // Применяем освещение и яркость
        color *= (diff + ambient) * brightness * 2.0;
        
        gl_FragColor = vec4(color, texColor.a);
        
        // Добавляем свечение
        gl_FragColor.rgb += color * 0.5;
        
        if(gl_FragColor.a < 0.1)
            discard;
    } else {
        // Для линий используем baseColor с небольшим влиянием waveColor
        vec3 lineColor = mix(baseColor, waveColor, abs(vDisplacement) * 5.0);
        lineColor *= (diff + ambient) * brightness * 1.5;
        
        gl_FragColor = vec4(lineColor, 0.7);
        
        // Добавляем свечение
        gl_FragColor.rgb += lineColor * 0.3;
    }
}
