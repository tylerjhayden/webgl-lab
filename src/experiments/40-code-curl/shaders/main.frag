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

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);
  vec2 cell = floor(vUv * gridSize);

  float eps = 0.1;
  vec2 curl = vec2(
    snoise(vec3(cell.x, cell.y + eps, uTime * 0.08)) - snoise(vec3(cell.x, cell.y - eps, uTime * 0.08)),
    snoise(vec3(cell.x - eps, cell.y, uTime * 0.08)) - snoise(vec3(cell.x + eps, cell.y, uTime * 0.08))
  );
  float n = snoise(vec3((cell + curl * 3.0) * NOISE_SCALE, uTime * 0.08));
  n = n * 0.5 + 0.5;

  float charIdx = floor(n * (CHAR_COUNT - 0.01));
  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  float angle = n * 6.283 + uTime * 0.15;
  vec3 color = 0.5 + 0.5 * cos(angle + vec3(0.0, 2.094, 4.188));

  // Carve a soft elliptical clearing behind the centered text block so the
  // characters don't fight the headline. The ellipse is wider than tall to
  // match the headline's two-line shape.
  vec2 textOffset = (vUv - vec2(0.5, 0.52)) / vec2(0.46, 0.22);
  float textDist = length(textOffset);
  float textMask = smoothstep(0.55, 1.35, textDist);

  float alpha = charAlpha * (0.35 + n * 0.45) * uAtlasReady * textMask;
  gl_FragColor = vec4(color, alpha);
}
