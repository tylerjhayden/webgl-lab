precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float CHAR_COUNT = 8.0;

// Hex grid resolution (cells across the long axis)
const float HEX_COLS = 90.0;

// Voronoi site grid (9 cols x 3 rows = 27 sites)
const float SITE_COLS = 9.0;
const float SITE_ROWS = 3.0;

// Border thickness multiplier for (d2 - d1)
const float BORDER_SCALE = 6.0;

const vec3 BASE_COLOR = vec3(0.45, 0.40, 0.32);     // warm sepia interior
const vec3 ACCENT_COLOR = vec3(0.24, 0.18, 0.14);   // ink-brown border (#3d2f24)

// Stable hash: 2D -> 2D in [0,1]
vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return fract(sin(p) * 43758.5453);
}

// Stable hash: 2D -> 1D
float hash1(vec2 p) {
  return fract(sin(dot(p, vec2(41.3, 289.1))) * 45758.5453);
}

void main() {
  float aspect = uResolution.x / uResolution.y;

  // ---- HEX GRID SAMPLING ----
  // Map UV to a hex coordinate space. Each pixel resolves to an integer hex
  // cell (q, r) and we use the cell center as the field sample point.
  // hexSize is the hex "radius"; we normalize so HEX_COLS hexes span the width.
  float hexSize = 1.0 / HEX_COLS;

  // Stretch UV by aspect so hexes are regular (not squashed)
  vec2 p = vec2(vUv.x * aspect, vUv.y);

  // Cartesian -> axial (pointy-top hex)
  float q = (sqrt(3.0) / 3.0 * p.x - 1.0 / 3.0 * p.y) / hexSize;
  float r = (2.0 / 3.0 * p.y) / hexSize;

  // Cube-coord rounding for axial coords
  float x = q;
  float z = r;
  float y = -x - z;

  float rx = floor(x + 0.5);
  float ry = floor(y + 0.5);
  float rz = floor(z + 0.5);

  float dx = abs(rx - x);
  float dy = abs(ry - y);
  float dz = abs(rz - z);

  if (dx > dy && dx > dz) {
    rx = -ry - rz;
  } else if (dy > dz) {
    ry = -rx - rz;
  } else {
    rz = -rx - ry;
  }

  vec2 hex = vec2(rx, rz); // rounded axial coords

  // Hex center back in cartesian (aspect-stretched)
  vec2 hexCenter = vec2(
    hexSize * sqrt(3.0) * (hex.x + hex.y * 0.5),
    hexSize * 1.5 * hex.y
  );

  // Convert hex center back to standard UV space
  vec2 cellUv = vec2(hexCenter.x / aspect, hexCenter.y);

  // ---- VORONOI FIELD ----
  // Sample the cell center against a 9x3 jittered, time-drifting site grid.
  // Sample-space stretches by aspect so site cells are roughly square in pixels.
  vec2 sampleP = vec2(cellUv.x * aspect, cellUv.y);
  vec2 siteGrid = vec2(SITE_COLS, SITE_ROWS);
  vec2 siteCellSize = vec2(aspect, 1.0) / siteGrid;

  vec2 gridPos = sampleP / siteCellSize;
  vec2 gridCell = floor(gridPos);
  vec2 gridFrac = fract(gridPos);

  float d1 = 8.0;
  float d2 = 8.0;

  for (int j = -1; j <= 1; j++) {
    for (int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 cellId = gridCell + neighbor;

      // Per-site jitter (stable random base)
      vec2 jitter = hash2(cellId);

      // Per-site drift frequencies (stable per cell)
      float freq = 0.25 + hash1(cellId + 17.0) * 0.5;
      float phase = hash1(cellId + 31.0) * 6.2831;

      // Drift the site by a small time-driven offset
      vec2 drift = 0.18 * vec2(
        sin(uTime * freq + phase),
        cos(uTime * freq * 0.9 + phase * 1.3)
      );

      vec2 sitePos = neighbor + clamp(jitter + drift, vec2(0.05), vec2(0.95));
      float dist = length(sitePos - gridFrac);

      if (dist < d1) {
        d2 = d1;
        d1 = dist;
      } else if (dist < d2) {
        d2 = dist;
      }
    }
  }

  // Border-thickness density: borders of cells are dense, interiors sparse
  float density = clamp((d2 - d1) * BORDER_SCALE, 0.0, 1.0);
  // Invert so borders (small d2-d1) read DENSE and interiors read SPARSE
  density = 1.0 - density;

  // ---- GLYPH STAMP ----
  // Map density to atlas char index (0..7)
  float charIdx = floor(density * (CHAR_COUNT - 0.01));

  // Square stamp inside each hex cell. Use local position relative to hex
  // center, scaled so the stamp comfortably fits within the hex.
  vec2 local = (p - hexCenter) / hexSize;     // hex-radius-normalized
  vec2 localUv = local * 0.5 + 0.5;            // -> [0,1] inside a 2x2 box
  localUv = clamp(localUv, 0.0, 1.0);

  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // ---- COLOR ----
  // Boundaries (low d2-d1) tinted toward accent; interiors stay muted.
  float borderProx = 1.0 - smoothstep(0.0, 0.12, d2 - d1);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, borderProx * 0.85);

  // Subtle breathing brightness keyed off time
  float pulse = 0.95 + 0.08 * sin(uTime * 0.4 + hash1(hex) * 6.2831);
  color *= pulse;

  float alpha = charAlpha * (0.35 + density * 0.55) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
