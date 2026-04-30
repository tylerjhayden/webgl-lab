precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;

const vec3 BASE_COLOR = vec3(0.10, 0.09, 0.11);
const vec3 ACCENT_COLOR = vec3(0.87, 0.65, 0.18);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  vec2 fromCenter = cellCenter - vec2(0.5);
  fromCenter.x *= aspect;
  float r = length(fromCenter) * 7.0;
  float theta = atan(fromCenter.y, fromCenter.x);
  float n = snoise(vec3(r, theta * 0.5, uTime * 0.08)) * 0.5 + 0.5;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  float colorBlend = smoothstep(0.55, 0.80, n);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  // Iridescent pearlescent aura — drifts through warm hues sampled by polar angle + time
  float angle = atan(vUv.y - 0.5, vUv.x - 0.5);
  float radial = length(vUv - 0.5);
  vec3 aura = 0.5 + 0.5 * cos(uTime * 0.2 + angle + vec3(0.0, 2.094, 4.188));
  color = mix(color, aura, 0.18 * smoothstep(0.2, 0.6, radial));

  float alpha = charAlpha * (0.3 + n * 0.55) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
