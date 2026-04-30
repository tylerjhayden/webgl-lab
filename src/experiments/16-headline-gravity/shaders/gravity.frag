precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;
uniform vec2 uHeadingCenter;    // UV (0..1)
uniform vec2 uHeadingHalfSize;  // UV half-extents

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.05;
const float PI = 3.14159265359;
const float TWO_PI = 6.28318530718;

const vec3 BASE_COLOR = vec3(0.40, 0.36, 0.30);     // umber arrows
const vec3 ACCENT_COLOR = vec3(0.35, 0.43, 0.25);   // moss pull-zone (#5a6e3f)

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Elliptical distance to the heading bbox: 0 at center, 1 at bbox edge, >1 outside.
  // halfSize floor avoids divide-by-zero on first frame before the bbox uniform is set.
  vec2 halfSize = max(uHeadingHalfSize, vec2(0.001));
  vec2 toHeading = uHeadingCenter - cellCenter;
  float d = length(toHeading / halfSize);

  // Angle from cell to heading (used to pick arrow direction)
  // atan2 returns -PI..PI. Bin into 8 slots so atlas index 0 = ←.
  float angle = atan(toHeading.y, toHeading.x);
  float bin = floor((angle + PI) / TWO_PI * CHAR_COUNT);
  bin = mod(bin, CHAR_COUNT);

  // Subtle simplex flicker — keeps the field from feeling static.
  float flicker = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.12));
  flicker = flicker * 0.5 + 0.5; // 0..1

  // Density mask: VOID near heading, ramping back to full beyond d ~ 1.5.
  // smoothstep(0.0, 1.5, d) → 0 inside heading, 1 outside void edge.
  float voidMask = smoothstep(0.0, 1.5, d);

  // Add a tiny amount of flicker to the density (~0.1 amplitude) so cells
  // breathe rather than flat-render.
  float density = voidMask * (0.9 + flicker * 0.1);

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip
  vec2 atlasUv = vec2((bin + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color: blend base gray toward accent in the inner falloff ring,
  // strongest right at the void edge (d ~ 1) where arrows are densest.
  float ringGlow = exp(-pow(d - 1.0, 2.0) * 4.0);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, ringGlow * 0.65);
  color *= 1.0 + ringGlow * 0.4;

  // Final alpha: char shape * density * void mask.
  float alpha = charAlpha * density * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
