precision highp float;

#include "noise.glsl"

uniform float uTime;
uniform vec2 uResolution;
uniform sampler2D uAtlas;
uniform float uAtlasReady;

varying vec2 vUv;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

const float RINGS = 24.0;
const float BINS = 64.0;
const float CHAR_COUNT = 8.0;
const float NOISE_SCALE = 0.18;

const float SWEEP_SPEED = 0.10;     // radians/sec — full revolution ~63s, ~1 bin/sec
const float DECAY = 1.4;            // phosphor decay τ; smaller = longer trail
const float MAX_R = 0.48;           // outer ring radius in screen-uv space (centered)

const vec3 BASE_COLOR = vec3(0.50, 0.44, 0.36);     // faded umber baseline
const vec3 PHOSPHOR_COLOR = vec3(0.66, 0.36, 0.24); // burnt sienna sweep (#a85b3c)

void main() {
  float aspect = uResolution.x / uResolution.y;

  // Centered, aspect-corrected coords
  vec2 centered = vUv - 0.5;
  centered.x *= aspect;

  float r = length(centered);
  float theta = atan(centered.y, centered.x); // -π..π

  // Outside the radar dial — render nothing
  if (r > MAX_R) {
    gl_FragColor = vec4(0.0);
    return;
  }

  // Polar cell indices. Rings get smaller toward center (denser),
  // by quantizing r/MAX_R rather than r directly.
  float rNorm = r / MAX_R;
  float ring = floor(rNorm * RINGS);
  float bin = floor((theta + PI) / TAU * BINS);

  // Base density from simplex noise — keyed on (ring, bin) so each cell
  // gets a stable glyph that drifts over time.
  float n = snoise(vec3(ring * NOISE_SCALE, bin * NOISE_SCALE * 0.4, uTime * 0.15));
  n = n * 0.5 + 0.5;

  // Sweep: angular distance from cell center to the rotating wedge.
  // angDelta ∈ [0, 2π); 0 = just swept (bright), high = long ago (dim).
  float sweepAngle = mod(uTime * SWEEP_SPEED, TAU);
  float cellAngle = (bin + 0.5) / BINS * TAU; // [0, 2π)
  float angDelta = mod(sweepAngle - cellAngle, TAU);
  float sweepBrightness = exp(-angDelta * DECAY);

  // Combined density drives glyph index: noise gives texture, sweep adds punch.
  float density = clamp(n * 0.6 + sweepBrightness * 0.4, 0.0, 1.0);
  float charIdx = floor(density * (CHAR_COUNT - 0.01));

  // Local UV inside the polar cell — radial axis × angular axis.
  // We want each cell to get a fresh glyph quad; map to (angular_local, radial_local).
  float ringLocal = fract(rNorm * RINGS);
  float binLocal = fract((theta + PI) / TAU * BINS);
  vec2 localUv = vec2(binLocal, ringLocal);

  // Atlas lookup — horizontal strip of glyphs.
  vec2 atlasUv = vec2((charIdx + localUv.x) / CHAR_COUNT, localUv.y);
  float charAlpha = texture2D(uAtlas, atlasUv).r;

  // Color: gray baseline, fading to phosphor green where the sweep just passed.
  vec3 color = mix(BASE_COLOR, PHOSPHOR_COLOR, sweepBrightness);

  // Brighten freshly-swept cells.
  float brightness = 1.0 + sweepBrightness * 1.6;
  color *= brightness;

  // Outer-edge fade so the dial dissolves softly into the background.
  float edgeFade = smoothstep(MAX_R, MAX_R - 0.06, r);

  // Center fade — avoid the singular pixel at r=0 looking aliased.
  float centerFade = smoothstep(0.0, 0.02, r);

  float alpha = charAlpha * (0.35 + density * 0.55) * edgeFade * centerFade * uAtlasReady;
  gl_FragColor = vec4(color, alpha);
}
