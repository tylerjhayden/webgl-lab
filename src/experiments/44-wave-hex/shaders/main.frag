precision highp float;

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float HEX_SIZE = 0.018;
const float CHAR_COUNT = 8.0;

const vec3 BASE_COLOR   = vec3(0.39, 0.42, 0.53);
const vec3 ACCENT_COLOR = vec3(0.388, 0.4, 0.945);

vec2 hexCellCenter(vec2 uv) {
  float q = (2.0 / 3.0 * uv.x) / HEX_SIZE;
  float r = (-1.0 / 3.0 * uv.x + sqrt(3.0) / 3.0 * uv.y) / HEX_SIZE;
  float rq = round(q);
  float rr = round(r);
  float rs = round(-q - r);
  float dq = abs(rq - q);
  float dr = abs(rr - r);
  float ds = abs(rs - (-q - r));
  if (dq > dr && dq > ds) rq = -rr - rs;
  else if (dr > ds) rr = -rq - rs;
  return vec2(HEX_SIZE * 1.5 * rq, HEX_SIZE * sqrt(3.0) * (rr + rq * 0.5));
}

void main() {
  float aspect = uResolution.x / uResolution.y;

  vec2 center = hexCellCenter(vec2(vUv.x * aspect, vUv.y));

  float f1 = sin(center.x * 0.4 + uTime * 0.8) * cos(center.y * 0.4 - uTime * 0.6);
  float f2 = sin((center.x + center.y) * 0.25 + uTime * 0.5);
  float n = (f1 + f2) * 0.5 + 0.5;

  float cols = 1.0 / (HEX_SIZE * 1.5 / aspect);
  vec2 gridSize = vec2(cols, cols / aspect);
  vec2 localUv = fract(vUv * gridSize);

  float charIdx = floor(n * (CHAR_COUNT - 0.01));
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  vec3 color = mix(BASE_COLOR, ACCENT_COLOR, n * 0.3);
  float alpha = charAlpha * (0.3 + n * 0.4) * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
