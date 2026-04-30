precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float ATLAS_COUNT = 17.0;     // 16 reveal tokens + 1 solid block
const float REVEAL_COUNT = 16.0;    // tokens 0..15
const float BLOCK_INDEX = 16.0;     // last cell in atlas
const float NOISE_SCALE = 0.04;
const float MOUSE_RADIUS = 0.18;

const vec3 BASE_COLOR = vec3(0.20, 0.30, 0.10);    // deep murky olive, grounds the field
const vec3 ACCENT_COLOR = vec3(0.65, 1.00, 0.10);   // #a6ff1a acid-neon highlighter green

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float sampleAtlas(float idx, vec2 localUv) {
  vec2 atlasUv = vec2((idx + localUv.x) / ATLAS_COUNT, localUv.y);
  return texture2D(uAtlas, atlasUv).r;
}

void main() {
  // Aspect-correct grid sizing — same as baseline
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Subtle simplex shimmer so the redacted field feels "alive"
  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.15));
  n = n * 0.5 + 0.5; // remap -1..1 to 0..1

  // Mouse distance — gaussian/aspect-corrected, same shape as baseline
  vec2 mouseDelta = cellCenter - uMouse;
  mouseDelta.x *= aspect;
  float mouseDist = length(mouseDelta);

  // Reveal mask — 1 inside radius, 0 outside, smoothstep band for soft edge
  float reveal = smoothstep(MOUSE_RADIUS, MOUSE_RADIUS * 0.6, mouseDist);

  // Deterministic per-cell hash → token index in [0, REVEAL_COUNT)
  float h = hash21(cell);
  float hashIndex = floor(h * REVEAL_COUNT);

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Sample BOTH the block glyph and the revealed token glyph, blend across the band.
  float blockAlpha = sampleAtlas(BLOCK_INDEX, localUv);
  float revealAlpha = sampleAtlas(hashIndex, localUv);
  float charAlpha = mix(blockAlpha, revealAlpha, reveal);

  // Color: base gray, shifting to accent near mouse
  float colorBlend = smoothstep(0.35, 0.0, mouseDist);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  // Brighten characters near mouse (declassified rows glow)
  float brightness = 1.0 + reveal * 0.6;
  color *= brightness;

  // Surveillance-footage flicker: aggressive per-cell brightness modulation from noise.
  // CRT scintillation — radioactive, alive.
  float flicker = 0.75 + n * 0.50;

  float alpha = charAlpha * flicker * uAtlasReady;
  alpha *= 0.85 + 0.15 * sin(vUv.y * uResolution.y * 3.14159);
  gl_FragColor = vec4(color, alpha);
}
