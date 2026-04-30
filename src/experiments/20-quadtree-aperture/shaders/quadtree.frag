precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

// Quadtree subdivision tiers: discrete levels read more "quadtree-like" than smooth.
// Level 0 = 30 cols (coarse), Level 3 = 240 cols (max subdivision).
const float BASE_COLS = 30.0;
const float MAX_LEVEL = 3.0;

const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;

// Lissajous-orbit aperture parameters.
const float APERTURE_RADIUS = 0.32;
const float APERTURE_AMP_X = 0.30;
const float APERTURE_AMP_Y = 0.20;
const float APERTURE_FREQ_X = 0.15;
const float APERTURE_FREQ_Y = 0.11;

const vec3 paperBase = vec3(0.78, 0.74, 0.66); // warm tinted paper-grey

void main() {
  float aspect = uResolution.x / uResolution.y;

  // Autonomous Lissajous-orbit aperture — slowly traverses the field.
  vec2 aperture = vec2(
    0.5 + APERTURE_AMP_X * sin(uTime * APERTURE_FREQ_X),
    0.5 + APERTURE_AMP_Y * cos(uTime * APERTURE_FREQ_Y)
  );

  // Aspect-corrected distance from this pixel to the aperture center.
  vec2 apDelta = (vUv - aperture) * vec2(aspect, 1.0);
  float dist = length(apDelta);

  // Detail mask: 1.0 inside the aperture's focal core, 0.0 outside.
  float detail = smoothstep(APERTURE_RADIUS, APERTURE_RADIUS * 0.4, dist);

  // Quantize into discrete subdivision levels (0, 1, 2, 3) — quadtree-like.
  float level = floor(detail * (MAX_LEVEL + 0.999));
  float subdivLevel = BASE_COLS * pow(2.0, level);

  // Aspect-correct grid sizing.
  vec2 gridSize = vec2(subdivLevel, subdivLevel / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Simplex noise at cell position.
  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.15));
  n = n * 0.5 + 0.5;

  // Map noise to character index (0-7).
  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  // Position within the cell (local UV).
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip.
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Iridescent aura — hue shifts across pearl/peach/lilac as time and aperture drift.
  float hue = 0.5 + 0.5 * sin(uTime * 0.1 + vUv.x * 3.0 + vUv.y * 2.0);
  vec3 pearl1 = vec3(0.82, 0.88, 0.95); // pearl blue
  vec3 pearl2 = vec3(0.96, 0.85, 0.78); // peach
  vec3 pearl3 = vec3(0.88, 0.82, 0.95); // lilac
  vec3 iridescent = mix(pearl1, pearl2, hue);
  iridescent = mix(iridescent, pearl3, 0.5 + 0.5 * cos(uTime * 0.07 + vUv.x * 2.0));

  // Paper base outside aperture, iridescent inside, blended through detail mask.
  vec3 color = mix(paperBase * 0.45, iridescent, detail * 0.95);
  float brightness = 1.0 + detail * 0.4;
  color *= brightness;

  // Final output — character alpha drives visibility.
  float alpha = charAlpha * (0.4 + n * 0.5) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
