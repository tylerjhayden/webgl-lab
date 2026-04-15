precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

// --- Perspective grid ---

float gridLine(float coord, float width) {
  float d = abs(fract(coord - 0.5) - 0.5);
  return 1.0 - smoothstep(0.0, width, d);
}

void main() {
  vec2 uv = vUv;
  float aspect = uResolution.x / uResolution.y;

  // Only render grid in the lower portion of the screen
  float floorStart = 0.55;
  float floorMask = smoothstep(floorStart, floorStart - 0.02, uv.y);

  // Remap y into depth (0 at horizon, increasing toward bottom)
  float rawY = clamp((floorStart - uv.y) / floorStart, 0.001, 1.0);
  float perspectiveStrength = 3.0;
  float depth = 1.0 / (rawY * perspectiveStrength + 0.1);

  // Vanishing point offset by mouse
  vec2 mouse = uMouse - 0.5;
  float vpOffsetX = mouse.x * 0.3;

  // Perspective-corrected UVs
  float pU = (uv.x - 0.5 - vpOffsetX) * aspect * depth;
  float pV = depth * 2.0 + uTime * 0.15; // slow scroll forward

  // Grid scales
  float gridScale = 1.0;
  float fineScale = gridScale * 4.0;

  // Line width increases with depth for natural AA
  float baseWidth = 0.03 + depth * 0.003;
  float fineWidth = baseWidth * 0.6;

  // Primary grid
  float xLine = gridLine(pU * gridScale, baseWidth);
  float yLine = gridLine(pV * gridScale, baseWidth);
  float primaryGrid = max(xLine, yLine);

  // Fine grid
  float xFine = gridLine(pU * fineScale, fineWidth);
  float yFine = gridLine(pV * fineScale, fineWidth);
  float fineGrid = max(xFine, yFine) * 0.25;

  // Intersection nodes — brighter where both lines cross
  float nodeGlow = xLine * yLine * 1.5;

  // Combine grid layers
  float grid = primaryGrid + fineGrid + nodeGlow;

  // Distance fade — exponential falloff
  float fadeRate = 0.12;
  float distanceFade = exp(-depth * fadeRate);
  grid *= distanceFade;

  // Mouse glow — project mouse into perspective space
  float mouseDepthY = clamp((floorStart - uMouse.y) / floorStart, 0.001, 1.0);
  float mouseDepth = 1.0 / (mouseDepthY * perspectiveStrength + 0.1);
  float mousePU = (uMouse.x - 0.5 - vpOffsetX) * aspect * mouseDepth;
  float mousePV = mouseDepth * 2.0 + uTime * 0.15;

  float glowDist = length(vec2(pU - mousePU, pV - mousePV) * 0.3);
  float mouseGlow = exp(-glowDist * glowDist * 8.0) * 0.6;

  // Base grid color (cool grey)
  vec3 gridColor = vec3(0.35, 0.38, 0.5);
  // Accent color for mouse glow
  vec3 accentColor = vec3(0.388, 0.400, 0.945); // #6366f1

  vec3 color = grid * gridColor + mouseGlow * accentColor;

  // Apply floor mask — grid only below horizon
  color *= floorMask;

  // Top region: subtle gradient from surface color
  float topGradient = smoothstep(0.9, 0.55, uv.y) * 0.02;
  color += vec3(topGradient);

  // Edge vignette
  float vignette = 1.0 - pow(abs(uv.x - 0.5) * 1.8, 2.5);
  color *= vignette;

  // Overall opacity — let the background show through
  float alpha = max(max(color.r, color.g), color.b) * 1.5;
  alpha = clamp(alpha, 0.0, 1.0);

  gl_FragColor = vec4(color, alpha * floorMask + topGradient);
}
