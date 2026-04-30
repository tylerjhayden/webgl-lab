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

// Trail params
const int TRAIL_LENGTH = 12;
const float SPAWN_INTERVAL = 0.4;
const float TAU = 2.0;
const float RADIUS = 0.08;
const float RADIUS_SQ = RADIUS * RADIUS;
const float TRAIL_STRENGTH = 0.9;

const vec3 BASE_COLOR = vec3(0.18, 0.10, 0.22);     // deep plum, muddy navy/purple bridge
const vec3 ACCENT_COLOR = vec3(0.95, 0.45, 0.55);   // #f27288 warm rose
const vec3 COMET_COLOR = vec3(1.00, 0.78, 0.55);    // #ffc78c soft peach biolume head

// Autonomous Lissajous path — slow figure-8-ish drift in UV space
vec2 trailPoint(float t) {
  return vec2(
    0.5 + 0.30 * sin(t * 0.20),
    0.5 + 0.20 * sin(t * 0.13)
  );
}

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Simplex noise at cell position — base field texture
  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.15));
  n = n * 0.5 + 0.5; // remap -1..1 to 0..1

  // Trail field — sum of decaying gaussian bumps along the autonomous path.
  // Most-recent attractor (i = 0) is brightest; older spawns fade with exp(-age/TAU).
  float trailField = 0.0;
  float headWeight = 0.0;
  for (int i = 0; i < TRAIL_LENGTH; i++) {
    float spawnTime = uTime - float(i) * SPAWN_INTERVAL;
    vec2 p = trailPoint(spawnTime);
    float age = float(i) * SPAWN_INTERVAL;
    float weight = exp(-age / TAU);
    vec2 d = (cellCenter - p) * vec2(aspect, 1.0);
    float bump = exp(-dot(d, d) / RADIUS_SQ);
    trailField += weight * bump;
    if (i == 0) headWeight = bump; // brightest only at the comet head
  }

  // Boost field density where the trail passes
  n = clamp(n + trailField * TRAIL_STRENGTH, 0.0, 1.0);

  // Map noise to character index (0-7)
  float charIdx = floor(n * (CHAR_COUNT - 0.01));

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color: base gray, shifting through accent toward comet-head highlight
  float accentMix = clamp(trailField * 1.2, 0.0, 1.0);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, accentMix);
  color = mix(color, COMET_COLOR, clamp(headWeight * 0.9, 0.0, 1.0));

  // Brighten characters along the trail — boosted so the warm head reads as biolume
  float brightness = 1.0 + trailField * 2.2;
  color *= brightness;

  // Final output — character alpha drives visibility
  float alpha = charAlpha * (0.4 + n * 0.5) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
