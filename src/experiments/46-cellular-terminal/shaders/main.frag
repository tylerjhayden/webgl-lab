precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;

const vec3 BASE_COLOR   = vec3(0.39, 0.42, 0.53);
const vec3 ACCENT_COLOR = vec3(0.388, 0.4, 0.945);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);
  vec2 cell = floor(vUv * gridSize);

  float steppedTime = floor(uTime * 3.0) * (1.0 / 3.0);
  float rawN = snoise(vec3(cell * 0.08, steppedTime * 0.4));
  float alive = step(0.05, rawN);
  float n = alive * (0.6 + 0.4 * snoise(vec3(cell * 0.08, uTime * 0.03)));

  float charIdx = floor(n * (CHAR_COUNT - 0.01));
  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, n * 0.3);
  float alpha = charAlpha * (0.3 + n * 0.4) * uAtlasReady * alive;
  gl_FragColor = vec4(color, alpha);
}
