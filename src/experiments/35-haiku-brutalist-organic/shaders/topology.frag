precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform sampler2D uLifeState;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;

const vec3 BASE_COLOR = vec3(0.39, 0.42, 0.53);
const vec3 ACCENT_COLOR = vec3(0.15, 0.9, 0.3);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Read Life state from texture
  vec2 lifeUv = cell / vec2(GRID_COLS, GRID_COLS / aspect);
  float n = texture2D(uLifeState, lifeUv).r;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color via position gradient: left-gray → right-accent
  float colorBlend = smoothstep(0.3, 0.7, cellCenter.x);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  float alpha = charAlpha * (0.3 + n * 0.55) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
