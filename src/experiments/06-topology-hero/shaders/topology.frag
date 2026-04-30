precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float GRID_ROWS = 50.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;
const float MOUSE_RADIUS = 0.15;
const float MOUSE_STRENGTH = 0.5;

const vec3 BASE_COLOR = vec3(0.39, 0.42, 0.53);    // text-muted-ish gray
const vec3 ACCENT_COLOR = vec3(0.388, 0.4, 0.945);  // #6366f1 indigo accent

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Simplex noise at cell position
  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.15));
  n = n * 0.5 + 0.5; // remap -1..1 to 0..1

  // Mouse distortion — gaussian bump
  vec2 mouseDelta = cellCenter - uMouse;
  mouseDelta.x *= aspect;
  float mouseDist = length(mouseDelta);
  float mouseInfluence = exp(-mouseDist * mouseDist / (MOUSE_RADIUS * MOUSE_RADIUS)) * MOUSE_STRENGTH;
  n = clamp(n + mouseInfluence, 0.0, 1.0);

  // Map noise to character index (0-7)
  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color: base gray, shifting to accent near mouse
  float colorBlend = smoothstep(0.35, 0.0, mouseDist);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  // Brighten characters near mouse
  float brightness = 1.0 + mouseInfluence * 1.5;
  color *= brightness;

  // Final output — character alpha drives visibility
  float alpha = charAlpha * (0.4 + n * 0.5) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
