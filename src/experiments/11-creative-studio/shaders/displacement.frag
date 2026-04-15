precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform vec2 uResolution;

varying vec2 vUv;

const vec3 LIME    = vec3(0.784, 0.941, 0.396);
const vec3 CYAN    = vec3(0.200, 0.800, 0.900);
const vec3 MAGENTA = vec3(0.850, 0.200, 0.700);
const vec3 VIOLET  = vec3(0.500, 0.200, 0.900);
const vec3 BG      = vec3(0.024, 0.024, 0.040);

void main() {
  float aspect = uResolution.x / uResolution.y;
  vec2 uv = vUv;

  /* ── Mouse displacement ── */
  vec2 delta = uv - uMouse;
  delta.x *= aspect;
  float dist = length(delta);

  // Radial push: gaussian falloff
  float radial = exp(-dist * dist / 0.02) * 0.04;
  vec2 push = normalize(delta + 0.0001) * radial;

  // Velocity warp: directional stretch
  vec2 velWarp = uMouseVelocity * exp(-dist * dist / 0.03) * 2.0;

  uv += push + velWarp;

  /* ── Mesh gradient: 4 orbiting color centers ── */
  float t = uTime * 0.3;

  vec2 c1 = vec2(0.5 + 0.30 * cos(t),               0.5 + 0.30 * sin(t));
  vec2 c2 = vec2(0.5 + 0.30 * cos(t + 1.571),       0.5 + 0.30 * sin(t + 1.571));
  vec2 c3 = vec2(0.5 + 0.25 * cos(t * 0.7 + 3.0),   0.5 + 0.25 * sin(t * 0.7 + 3.0));
  vec2 c4 = vec2(0.5 + 0.35 * cos(t * 0.5 + 5.0),   0.5 + 0.35 * sin(t * 0.5 + 5.0));

  // Aspect-correct distances
  vec2 d1 = uv - c1; d1.x *= aspect;
  vec2 d2 = uv - c2; d2.x *= aspect;
  vec2 d3 = uv - c3; d3.x *= aspect;
  vec2 d4 = uv - c4; d4.x *= aspect;

  // Inverse-distance weights (soft falloff)
  float w1 = 1.0 / (length(d1) + 0.3);
  float w2 = 1.0 / (length(d2) + 0.3);
  float w3 = 1.0 / (length(d3) + 0.3);
  float w4 = 1.0 / (length(d4) + 0.3);
  float wSum = w1 + w2 + w3 + w4;

  vec3 color = (LIME * w1 + CYAN * w2 + MAGENTA * w3 + VIOLET * w4) / wSum;

  // Blend toward dark background
  float brightness = wSum * 0.15;
  color = mix(BG, color, clamp(brightness, 0.0, 1.0));

  // Vignette
  color *= 0.7 + 0.3 * (1.0 - smoothstep(0.4, 1.0, length(vUv - 0.5) * 1.3));

  gl_FragColor = vec4(color, 1.0);
}
