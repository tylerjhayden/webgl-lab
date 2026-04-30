precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;

const vec3 BASE_COLOR   = vec3(0.18, 0.10, 0.05);
const vec3 ACCENT_COLOR = vec3(0.55, 0.22, 0.10);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);
  vec2 cell = floor(vUv * gridSize);

  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.1));
  n = n * 0.5 + 0.5;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));
  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, n * 0.7);
  float alpha = charAlpha * (0.3 + n * 0.4) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
