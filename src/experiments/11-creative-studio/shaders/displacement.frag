precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform vec2 uResolution;

varying vec2 vUv;

const vec3 LIME    = vec3(0.784, 0.941, 0.396);
const vec3 CYAN    = vec3(0.200, 0.850, 0.950);
const vec3 MAGENTA = vec3(0.900, 0.150, 0.650);
const vec3 VIOLET  = vec3(0.550, 0.150, 0.950);
const vec3 AMBER   = vec3(1.000, 0.600, 0.200);
const vec3 BG      = vec3(0.024, 0.024, 0.040);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;

  /* ── Mouse displacement ── */
  vec2 delta = uv - uMouse;
  delta.x *= aspect;
  float dist = length(delta);

  // Radial push: wider gaussian, stronger push
  float radial = exp(-dist * dist / 0.035) * 0.08;
  vec2 push = normalize(delta + 0.0001) * radial;

  // Velocity warp: aggressive directional stretch
  vec2 velWarp = uMouseVelocity * exp(-dist * dist / 0.05) * 5.0;

  uv += push + velWarp;

  /* ── Noise warp for organic texture ── */
  float t = uTime * 0.25;
  float warpN = snoise(vec3(uv * 2.0, t * 0.3));
  uv += warpN * 0.015;

  /* ── Mesh gradient: 5 orbiting color centers ── */
  vec2 c1 = vec2(0.5 + 0.35 * cos(t),               0.5 + 0.35 * sin(t));
  vec2 c2 = vec2(0.5 + 0.35 * cos(t + 1.257),       0.5 + 0.35 * sin(t + 1.257));
  vec2 c3 = vec2(0.5 + 0.30 * cos(t * 0.7 + 2.514), 0.5 + 0.30 * sin(t * 0.7 + 2.514));
  vec2 c4 = vec2(0.5 + 0.40 * cos(t * 0.5 + 3.770), 0.5 + 0.40 * sin(t * 0.5 + 3.770));
  vec2 c5 = vec2(0.5 + 0.25 * cos(t * 1.3 + 5.027), 0.5 + 0.25 * sin(t * 1.3 + 5.027));

  // Aspect-correct distances
  vec2 d1 = uv - c1; d1.x *= aspect;
  vec2 d2 = uv - c2; d2.x *= aspect;
  vec2 d3 = uv - c3; d3.x *= aspect;
  vec2 d4 = uv - c4; d4.x *= aspect;
  vec2 d5 = uv - c5; d5.x *= aspect;

  // Inverse-distance weights — tighter falloff for punchier blobs
  float w1 = 1.0 / (length(d1) + 0.2);
  float w2 = 1.0 / (length(d2) + 0.2);
  float w3 = 1.0 / (length(d3) + 0.2);
  float w4 = 1.0 / (length(d4) + 0.2);
  float w5 = 1.0 / (length(d5) + 0.2);
  float wSum = w1 + w2 + w3 + w4 + w5;

  vec3 color = (LIME * w1 + CYAN * w2 + MAGENTA * w3 + VIOLET * w4 + AMBER * w5) / wSum;

  // Blend toward dark — much brighter than original
  float brightness = wSum * 0.35;
  color = mix(BG, color, clamp(brightness, 0.0, 1.0));

  // Noise texture overlay for organic grain
  float texN = snoise(vec3(uv * 6.0, t)) * 0.5 + 0.5;
  color = mix(color, color * (0.85 + texN * 0.3), 0.3);

  // Vignette — lighter than original
  color *= 0.8 + 0.2 * (1.0 - smoothstep(0.5, 1.2, length(vUv - 0.5) * 1.2));

  // Film grain
  float grain = fract(sin(dot(vUv * uResolution.xy, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
  color += (grain - 0.5) * 0.035;

  gl_FragColor = vec4(color, 1.0);
}
