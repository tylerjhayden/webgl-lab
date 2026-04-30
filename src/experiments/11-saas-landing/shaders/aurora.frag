precision highp float;

#include "../../../shaders/noise.glsl"

varying vec2 vUv;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;
  vec2 aspectUV = vec2(uv.x * aspect, uv.y);
  vec2 aspectMouse = vec2(uMouse.x * aspect, uMouse.y);

  // --- Dot grid ---
  float gridSize = 30.0;
  vec2 gridUV = fract(uv * gridSize) - 0.5;
  float dotRadius = 0.12;
  float dot = 1.0 - smoothstep(dotRadius - 0.04, dotRadius, length(gridUV));

  // Dots near mouse brighten and scale up
  vec2 cellCenter = (floor(uv * gridSize) + 0.5) / gridSize;
  vec2 cellAspect = vec2(cellCenter.x * aspect, cellCenter.y);
  float distToMouse = length(cellAspect - aspectMouse);
  float mouseInfluence = exp(-distToMouse * distToMouse * 25.0);
  float dotBrightness = 0.06 + mouseInfluence * 0.25;
  vec3 dotColor = vec3(0.165, 0.165, 0.227) * dot * dotBrightness * 3.0; // #2a2a3a tinted

  // --- Radial glow ---
  float distFromMouse = length(aspectUV - aspectMouse);

  // Tight core
  float coreGlow = exp(-distFromMouse * distFromMouse * 150.0) * 0.3;
  // Wide halo
  float haloGlow = exp(-distFromMouse * distFromMouse * 16.0) * 0.12;

  // Noise-modulated accent hue — shifts between indigo and purple
  float noiseVal = snoise(vec3(uv * 2.0, uTime * 0.15));
  vec3 accentBase = vec3(0.388, 0.400, 0.945); // #6366f1
  vec3 accentShift = vec3(0.55, 0.35, 0.95);   // soft purple
  vec3 accent = mix(accentBase, accentShift, noiseVal * 0.5 + 0.5);

  vec3 glowColor = accent * (coreGlow + haloGlow);

  // --- Animated particles ---
  vec3 particleColor = vec3(0.0);
  for (int i = 0; i < 12; i++) {
    float fi = float(i);
    float freqX = 0.13 + fi * 0.047;
    float freqY = 0.11 + fi * 0.053;
    float phaseX = fi * 1.37;
    float phaseY = fi * 2.19;

    vec2 particlePos = vec2(
      0.5 + sin(uTime * freqX + phaseX) * 0.4,
      0.5 + cos(uTime * freqY + phaseY) * 0.4
    );

    vec2 pAspect = vec2(particlePos.x * aspect, particlePos.y);
    float dist = length(aspectUV - pAspect);

    // Particle size ~3px equivalent
    float pxSize = 3.0 / uResolution.y;
    float particle = 1.0 - smoothstep(0.0, pxSize * 2.0, dist);

    // Fade in/out
    float fadeFreq = 0.3 + fi * 0.1;
    float opacity = sin(uTime * fadeFreq + fi * 0.8) * 0.5 + 0.5;

    particleColor += accent * particle * opacity * 0.15;
  }

  // --- Combine ---
  vec3 color = dotColor + glowColor + particleColor;

  float alpha = max(max(color.r, color.g), color.b) * 2.0;
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha);
}
