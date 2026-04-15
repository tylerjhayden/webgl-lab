precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

varying vec2 vUv;

const vec3 BG = vec3(0.024, 0.024, 0.040);

float fbm(vec3 p) {
  return snoise(p) * 0.5 + snoise(p * 2.0) * 0.25 + snoise(p * 4.0) * 0.125;
}

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;
  float t = uTime * 0.15;

  // Mouse distance
  vec2 delta = uv - uMouse;
  delta.x *= aspect;
  float dist = length(delta);
  vec2 dir = normalize(delta + 0.0001);

  // Chromatic aberration strength
  float abr = smoothstep(0.5, 0.0, dist) * 0.015;

  // Sample noise with RGB channel offset
  float nR = fbm(vec3((uv + dir * abr) * 3.0, t));
  float nG = fbm(vec3(uv * 3.0, t));
  float nB = fbm(vec3((uv - dir * abr) * 3.0, t));

  // Ridge detection via central differences
  float eps = 0.005;
  float nX = fbm(vec3((uv + vec2(eps, 0.0)) * 3.0, t));
  float nY = fbm(vec3((uv + vec2(0.0, eps)) * 3.0, t));
  float ridge = smoothstep(0.3, 1.5, length(vec2(nX - nG, nY - nG)) / eps) * 0.15;

  // Map to subtle color on dark background
  vec3 color = BG;
  color.r += (nR * 0.5 + 0.5) * 0.08 + ridge;
  color.g += (nG * 0.5 + 0.5) * 0.06 + ridge * 0.7;
  color.b += (nB * 0.5 + 0.5) * 0.10 + ridge * 0.5;

  // Mouse proximity glow
  color += exp(-dist * dist / 0.04) * 0.05;

  gl_FragColor = vec4(color, 1.0);
}
