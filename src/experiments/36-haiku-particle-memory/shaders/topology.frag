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

const vec3 BASE_COLOR = vec3(0.16, 0.10, 0.18);
const vec3 ACCENT_COLOR = vec3(1.0, 0.42, 0.38);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  vec2 cell = floor(vUv * gridSize);

  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.12));
  n = n * 0.5 + 0.5;
  n *= 0.7 + sin(uTime * 0.4) * 0.3;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  float colorBlend = smoothstep(0.55, 0.80, n);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  // Subtle radial rose haze — warmth from the center
  vec2 fromCenter = vUv - 0.5;
  fromCenter.x *= aspect;
  color += vec3(0.15, 0.05, 0.05) * exp(-length(fromCenter) * 1.5);

  // Slow inhale/exhale breathing on the glow
  float breath = 0.6 + 0.4 * sin(uTime * 0.4);
  float alpha = charAlpha * (0.3 + n * 0.55) * breath * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
