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
varying vec2 vUv;

uniform float audioIntensity;
uniform float audioBass;
uniform float audioTreble;

void main() {
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;

//    if(vIsPoint > 0.5) {
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);

        // Смешиваем цвета на основе деформации, размера и аудио
        vec3 color = mix(baseColor, waveColor, max(abs(vDisplacement) * 10.0, vSizeFactor) * (1.0 + audioIntensity));

        // Применяем освещение и яркость с учетом аудио
        color *= (diff + ambient) * brightness * (2.0 + audioIntensity);

        gl_FragColor = vec4(color, texColor.a);

        // Добавляем свечение, зависящее от аудио
        gl_FragColor.rgb += color * 0.5 * (1.0 + audioBass * 0.5);

        // Добавляем мерцание на основе высоких частот
        gl_FragColor.rgb *= 1.0 + audioTreble * 0.2 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);

        if(gl_FragColor.a < 0.1)
            discard;
//    } else {
//        // Для линий используем baseColor с влиянием waveColor и аудио
//        vec3 lineColor = mix(baseColor, waveColor, abs(vDisplacement) * 5.0 * (1.0 + audioIntensity));
//        lineColor *= (diff + ambient) * brightness * (1.5 + audioIntensity * 0.5);
//        float distToPoint = length(fract(vUv * 30.0) - 0.5);
//        float lineAlpha = smoothstep(0.0, 0.1, distToPoint);
//        gl_FragColor = vec4(lineColor, lineAlpha);
//
//        // Добавляем свечение, зависящее от аудио
//        gl_FragColor.rgb += lineColor * 0.3 * (1.0 + audioBass * 0.3);
//    }
}