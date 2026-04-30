precision highp float;

#include "../../../shaders/noise.glsl"

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
  float t = uTime * 0.12;

  // Mouse distance
  vec2 delta = uv - uMouse;
  delta.x *= aspect;
  float dist = length(delta);
  vec2 dir = normalize(delta + 0.0001);

  // Chromatic aberration — 3x stronger, wider radius
  float abr = smoothstep(0.6, 0.0, dist) * 0.05;

  // Sample noise with RGB channel offset
  float nR = fbm(vec3((uv + dir * abr) * 3.0, t));
  float nG = fbm(vec3(uv * 3.0, t));
  float nB = fbm(vec3((uv - dir * abr) * 3.0, t));

  // Ridge detection
  float eps = 0.004;
  float nX = fbm(vec3((uv + vec2(eps, 0.0)) * 3.0, t));
  float nY = fbm(vec3((uv + vec2(0.0, eps)) * 3.0, t));
  float ridge = smoothstep(0.2, 1.2, length(vec2(nX - nG, nY - nG)) / eps) * 0.2;

  // Map to visible color — 2.5x brighter than original
  vec3 color = BG;
  color.r += (nR * 0.5 + 0.5) * 0.18 + ridge;
  color.g += (nG * 0.5 + 0.5) * 0.14 + ridge * 0.7;
  color.b += (nB * 0.5 + 0.5) * 0.22 + ridge * 0.5;

  // Mouse proximity glow — warm accent
  float glow = exp(-dist * dist / 0.04);
  color += glow * vec3(0.15, 0.12, 0.05);

  // Subtle grid lines — tech aesthetic
  float gridX = smoothstep(0.96, 1.0, abs(sin(uv.x * 60.0)));
  float gridY = smoothstep(0.96, 1.0, abs(sin(uv.y * 60.0)));
  color += (gridX + gridY) * 0.015 * (1.0 - glow * 0.8);

  // Horizontal scan lines
  float scan = sin(vUv.y * uResolution.y * 0.5) * 0.5 + 0.5;
  color *= 0.97 + scan * 0.03;

  // Film grain
  float grain = fract(sin(dot(vUv * uResolution.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  color += (grain - 0.5) * 0.03;

  gl_FragColor = vec4(color, 1.0);
}
