precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 16.0;
const float NOISE_SCALE = 0.045;
const float SCROLL_RATE = 3.5;

const vec3 BASE_COLOR = vec3(0.40, 0.70, 0.50); // soft phosphor green

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);

  // Scroll the row coordinate downward over time so the dump streams down.
  // (Visually: increasing y here = upward in screen space, so subtract
  // uTime * rate to move the sampled noise upward, which makes the
  // characters scroll downward.)
  float scrolledY = cell.y - uTime * SCROLL_RATE;

  // Simplex noise sample. Keep horizontal x raw so columns retain
  // independent variation — avoids a strict typewriter row look.
  float n = snoise(vec3(cell.x * NOISE_SCALE, scrolledY * NOISE_SCALE, 0.0));
  n = n * 0.5 + 0.5; // remap to 0..1

  // Map noise to one of 16 hex glyphs (0..f)
  float charIdx = floor(n * (CHAR_COUNT - 0.001));

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — 16-cell horizontal strip
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Subtle vertical falloff at top/bottom edges so the stream feels infinite
  float edgeFade = smoothstep(0.0, 0.08, vUv.y) * smoothstep(0.0, 0.08, 1.0 - vUv.y);

  // Brighter glyphs for higher noise — gives the dump density variation
  float alpha = charAlpha * (0.32 + n * 0.55) * edgeFade * uAtlasReady;
  gl_FragColor = vec4(BASE_COLOR, alpha);
}
