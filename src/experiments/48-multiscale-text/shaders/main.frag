precision highp float;

#include "../../../shaders/noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;
uniform sampler2D uTextMask;

varying vec2 vUv;

const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.04;

const vec3 WATERMARK_COLOR = vec3(0.55, 0.60, 0.50);
const vec3 INK_COLOR       = vec3(0.13, 0.18, 0.09);

void main() {
  float aspect = uResolution.x / uResolution.y;

  float d = length(vUv - 0.5) * 2.0;
  float cols = mix(120.0, 50.0, smoothstep(0.3, 0.9, d));
  vec2 gridSize = vec2(cols, cols / aspect);

  vec2 cell = floor(vUv * gridSize);

  float n = snoise(vec3(cell.x * NOISE_SCALE, cell.y * NOISE_SCALE, uTime * 0.1));
  n = n * 0.5 + 0.5;

  float textMask = texture2D(uTextMask, vUv).r;
  float maskGate = smoothstep(0.4, 0.7, textMask);

  float charIdx = floor(mix(n, 0.82 + n * 0.18, maskGate) * (CHAR_COUNT - 0.01));
  vec2 localUv = fract(vUv * gridSize);
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  vec3 color = mix(WATERMARK_COLOR, INK_COLOR, maskGate);

  float watermarkAlpha = charAlpha * (0.12 + n * 0.18);
  float inkAlpha = charAlpha * 0.95;
  float alpha = mix(watermarkAlpha, inkAlpha, maskGate) * uAtlasReady;

  gl_FragColor = vec4(color, alpha);
}
