uniform sampler2D pointTexture;
uniform vec3 baseColor;
uniform vec3 waveColor;
uniform float brightness;
uniform float time;
uniform float audioIntensity;

varying float vIsPoint;
varying float vGradientFactor;
varying vec3 vNormal;
varying float vDeformationFactor;
varying float vSizeFactor;
varying float vDisplacement;
varying vec2 vUv;

// Функция для ограничения яркости
vec3 limitBrightness(vec3 color, float maxBrightness) {
    float luminance = dot(color, vec3(0.299, 0.587, 0.114));
    if (luminance > maxBrightness) {
        float scale = maxBrightness / luminance;
        return color * scale;
    }
    return color;
}

// Функция для создания более резкого перехода
float sharpTransition(float value, float edge, float smoothness) {
    return smoothstep(edge - smoothness, edge + smoothness, value);
}
//void main() {
//    if (vIsPoint > 0.5) {
//        gl_FragColor = vec4(baseColor, 1.0);
//    } else {
//        gl_FragColor = vec4(waveColor, 1.0);
//    }
//}
void main() {
    gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0); // Красный цвет
    vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
    float diff = max(dot(vNormal, lightDir), 0.0);
    float ambient = 0.3;

    // Сглаживание аудио интенсивности
    float smoothAudio = audioIntensity * 0.5 * (1.0 + sin(time * 2.0));

    // Увеличиваем размер волны и делаем переход более резким
    float waveSize = 2.0;
    float waveSharpness = 0.1;

    if (vIsPoint > 0.5) {
        // Обработка точек
        vec4 texColor = texture2D(pointTexture, gl_PointCoord);

        float transitionFactor = sharpTransition(max(abs(vDisplacement) * 10.0, vSizeFactor) * waveSize, 0.5, waveSharpness);
        vec3 color = mix(baseColor, waveColor, transitionFactor);

        color *= (diff + ambient) * brightness * (2.0 + smoothAudio);

        float smoothAlpha = smoothstep(0.1, 0.2, texColor.a);
        gl_FragColor = vec4(color, smoothAlpha);

        gl_FragColor.rgb += color * 0.5 * (1.0 + smoothAudio * 0.5);

        gl_FragColor.rgb *= 1.0 + smoothAudio * 0.1 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);

        if (gl_FragColor.a < 0.1) discard;
    } else {
        // Обработка линий
        float transitionFactor = sharpTransition(abs(vDisplacement) * 5.0 * waveSize, 0.5, waveSharpness);
        vec3 lineColor = mix(baseColor, waveColor, transitionFactor);
        lineColor *= (diff + ambient) * brightness * (3.5 + smoothAudio);

        float distToPoint = length(fract(vUv * 30.0) - 0.5);
        float lineAlpha = smoothstep(0.0, 0.05, distToPoint);

        gl_FragColor = vec4(lineColor, lineAlpha);

        gl_FragColor.rgb += lineColor * 0.8 * (1.0 + smoothAudio);

        gl_FragColor.rgb *= 1.0 + smoothAudio * 0.15 * sin(gl_FragCoord.x * 0.1 + gl_FragCoord.y * 0.1);
    }

    // Дополнительное увеличение яркости для всего
    gl_FragColor.rgb *= 1.1;

    // Применяем ограничение яркости
    float maxBrightness = 0.8;
    gl_FragColor.rgb = limitBrightness(gl_FragColor.rgb, maxBrightness);

    // Дополнительное снижение яркости для очень ярких цветов
    float luminance = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
    float brightnessReduction = smoothstep(0.7, 1.0, luminance);
    gl_FragColor.rgb *= 1.0 - brightnessReduction * 0.5;
}
