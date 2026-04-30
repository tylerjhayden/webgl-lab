precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float GRID_COLS = 120.0;
const float CHAR_COUNT = 8.0;

const vec3 BASE_COLOR = vec3(0.18, 0.14, 0.12);   // walnut ink
const vec3 ACCENT_COLOR = vec3(0.55, 0.30, 0.20); // faded vermilion

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 gridSize = vec2(GRID_COLS, GRID_COLS / aspect);

  vec2 cell = floor(vUv * gridSize);

  float n = snoise(vec3(cell.x*0.06, cell.y*0.06, uTime*0.30)) * 0.55
          + snoise(vec3(cell.x*0.14, cell.y*0.14, uTime*0.80)) * 0.30
          + snoise(vec3(cell.x*0.28, cell.y*0.28, uTime*1.50)) * 0.15;
  n = n * 0.5 + 0.5;

  float charIdx = floor((1.0 - n) * (CHAR_COUNT - 0.01));

  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  float colorBlend = smoothstep(0.55, 0.80, n);
  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, colorBlend);

  float alpha = charAlpha * (0.3 + n * 0.55) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
