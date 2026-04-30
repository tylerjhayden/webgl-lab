precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;
const float MOUSE_RADIUS = 0.18;
const float SWIRL_STRENGTH = 1.6;
const float PI = 3.14159265359;

const vec3 BASE_COLOR = vec3(0.45, 0.40, 0.32);    // sumi-ink wash baseline
const vec3 ACCENT_COLOR = vec3(0.23, 0.29, 0.37);  // indigo-dye stroke (#3a4a5e)

// Scalar potential — animated 3D simplex noise.
float potential(vec2 p, float t) {
  return snoise(vec3(p, t));
}

// 2D curl from a single scalar potential — gives a divergence-free vector field.
vec2 curl2D(vec2 p, float t) {
  float eps = 0.01;
  float dPdy = (potential(p + vec2(0.0, eps), t) - potential(p - vec2(0.0, eps), t)) / (2.0 * eps);
  float dPdx = (potential(p + vec2(eps, 0.0), t) - potential(p - vec2(eps, 0.0), t)) / (2.0 * eps);
  return vec2(dPdy, -dPdx);
}

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Curl-noise vector field at cell position.
  vec2 v = curl2D(cell * NOISE_SCALE, uTime * 0.15);

  // Cursor swirl — adds tangential velocity around mouse, gaussian falloff.
  vec2 mouseDelta = cellCenter - uMouse;
  mouseDelta.x *= aspect;
  float mouseDist = length(mouseDelta);
  float mouseInfluence = exp(-mouseDist * mouseDist / (MOUSE_RADIUS * MOUSE_RADIUS));
  // Tangent (90deg CCW rotation of mouseDelta): perpendicular to radial direction.
  vec2 tangent = vec2(-mouseDelta.y, mouseDelta.x);
  if (mouseDist > 1e-5) tangent /= mouseDist; // normalize for unit-magnitude swirl
  v += tangent * mouseInfluence * SWIRL_STRENGTH;

  // Field magnitude (used for visibility) and angle (used for glyph index).
  float mag = length(v);
  float angle = atan(v.y, v.x); // -PI..PI

  // Map angle to one of 8 directional arrows: ← ↖ ↑ ↗ → ↘ ↓ ↙
  // Glyph indices increase clockwise from ← (at angle = π).
  // Half-bin offset centers each glyph on its canonical direction.
  float binF = (PI - angle) / (2.0 * PI) * CHAR_COUNT + 0.5;
  float charIdx = floor(mod(binF, CHAR_COUNT));

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip.
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color: base gray, shifting to accent near mouse
  float colorBlend = smoothstep(0.35, 0.0, mouseDist);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  // Brighten characters near mouse
  float brightness = 1.0 + mouseInfluence * 1.2;
  color *= brightness;

  // Visibility scales with field magnitude so weak-flow cells fade.
  float visibility = clamp(mag * 0.7 + 0.25, 0.0, 1.0);
  float alpha = charAlpha * visibility * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
