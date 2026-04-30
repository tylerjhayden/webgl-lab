precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;
const float CONTOUR_DENSITY = 7.0;

const vec3 BASE_COLOR = vec3(0.78, 0.80, 0.72);    // tinted-grey, sage-pulled
const vec3 ACCENT_COLOR = vec3(0.45, 0.55, 0.38);  // #738c61 muted pistachio/sage

// Hand-coded call-graph peaks — vec3(x, y, baseHeight) plus radius via array
// Field domain is roughly aspect-corrected (x scaled by aspect), y in [0,1]
// We pick coordinates in that working domain.
const int PEAK_COUNT = 8;

float peakField(vec2 p, float t) {
  // peaks: (cx, cy, baseHeight, radius)
  vec4 peaks[8];
  peaks[0] = vec4(0.40, 0.55, 1.00, 0.18); // main()
  peaks[1] = vec4(1.05, 0.70, 0.85, 0.14); // render()
  peaks[2] = vec4(1.55, 0.40, 0.95, 0.16); // resolve()
  peaks[3] = vec4(0.75, 0.25, 0.70, 0.12); // parse()
  peaks[4] = vec4(0.20, 0.85, 0.60, 0.10); // log()
  peaks[5] = vec4(1.30, 0.85, 0.75, 0.13); // dispatch()
  peaks[6] = vec4(0.95, 0.45, 0.55, 0.09); // hash()
  peaks[7] = vec4(1.75, 0.78, 0.65, 0.11); // commit()

  // phase offsets for the pulse — keeps each peak breathing on its own rhythm
  float phases[8];
  phases[0] = 0.00;
  phases[1] = 1.20;
  phases[2] = 2.40;
  phases[3] = 0.80;
  phases[4] = 3.10;
  phases[5] = 1.90;
  phases[6] = 2.70;
  phases[7] = 0.40;

  float field = 0.0;
  for (int i = 0; i < PEAK_COUNT; i++) {
    vec4 pk = peaks[i];
    float pulse = 0.85 + 0.15 * sin(t * 0.2 + phases[i]);
    float h = pk.z * pulse;
    vec2 d = (p - pk.xy) / pk.w;
    field += h * exp(-dot(d, d));
  }
  return field;
}

void main() {
  // Aspect-correct grid sizing
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  // Which character cell are we in?
  vec2 cell = floor(vUv * gridSize);
  vec2 cellCenter = (cell + 0.5) / gridSize;

  // Field-domain position (x scaled by aspect so peaks stay round)
  vec2 p = vec2(cellCenter.x * aspect, cellCenter.y);

  // Sum of gaussian peaks — the "call graph" heightmap
  float field = peakField(p, uTime);

  // Normalize loosely into 0..1 range (peaks max around ~1.0-1.2)
  float n = clamp(field * 0.85, 0.0, 1.0);

  // Contour-line emphasis — banded distance-to-isoline
  float contour = abs(fract(field * CONTOUR_DENSITY) - 0.5) * 2.0;
  // contour now 0 (on a line) → 1 (between lines)
  float lineMask = 1.0 - smoothstep(0.0, 0.35, contour);

  // Map contour proximity to glyph index — sharp lines get heavier glyphs
  // Off-line cells fade into lighter ramp glyphs by field height
  float glyphFromLine = lineMask * (CHAR_COUNT - 1.0);
  float glyphFromField = n * (CHAR_COUNT - 1.0) * 0.55;
  float charIdx = floor(max(glyphFromLine, glyphFromField) + 0.001);
  charIdx = clamp(charIdx, 0.0, CHAR_COUNT - 1.0);

  // Position within the cell (local UV)
  vec2 localUv = fract(vUv * gridSize);

  // Atlas lookup — characters are in a horizontal strip
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Inverted theme: dark ink reads on light paper background.
  // Charcoal base shifts toward sage along contour lines.
  float alpha = charAlpha * (0.30 + lineMask * 0.55 + n * 0.20) * uAtlasReady;
  vec3 inkColor = mix(vec3(0.20, 0.22, 0.18), vec3(0.30, 0.40, 0.25), lineMask * 0.7);
  gl_FragColor = vec4(inkColor, alpha);
}
