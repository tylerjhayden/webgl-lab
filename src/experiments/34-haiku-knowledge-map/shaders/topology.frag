precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;

const vec3 BASE_COLOR = vec3(0.39, 0.42, 0.53);
const vec3 ACCENT_COLOR = vec3(0.388, 0.4, 0.945);

float fbm(vec3 p) {
  return snoise(p)*0.5 + snoise(p*2.0)*0.25 + snoise(p*4.0)*0.125;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  vec2 cell = floor(vUv * gridSize);

  float n = fbm(vec3(cell.x*NOISE_SCALE, cell.y*NOISE_SCALE, uTime*0.10)) * 0.5 + 0.5;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  float colorBlend = smoothstep(0.55, 0.80, n);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  float alpha = charAlpha * (0.3 + n * 0.55) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
