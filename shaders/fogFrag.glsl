precision highp float;

uniform sampler2D tex;
uniform float fogDarkness; // Контроль темноты
uniform float fogDensity;  // Новый uniform для контроля плотности

varying vec3 vPosition;
varying vec2 vUv;
varying vec3 vColor;
varying float vBlink;

void main() {
  vec2 p = vUv * 2.0 - 1.0;

  vec4 texColor = texture2D(tex, vUv);
  
  // Преобразуем цвет в оттенки серого
  float gray = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
  
  // Применяем эффект мерцания и позиционное затемнение
  float effect = gray - vBlink * length(p) * 0.8;
  
  // Смешиваем с базовым цветом частицы для сохранения некоторой вариативности
  vec3 color = mix(vec3(effect), vColor, 0.2);
  
  // Применяем общее затемнение
  color *= (1.0 - fogDarkness);

  // Рассчитываем непрозрачность с учетом плотности
  float baseOpacity = texColor.a * (0.3 + fogDarkness * 0.7);
  float opacity = baseOpacity * fogDensity;

  gl_FragColor = vec4(color, opacity);
}
