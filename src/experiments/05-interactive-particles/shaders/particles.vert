attribute float aScale;
attribute vec3 aRandomness;

uniform float uTime;
uniform float uSize;
uniform vec2 uMouse;
uniform float uMouseRadius;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec3 pos = position;

  // Animate with randomness
  pos.x += sin(uTime * aRandomness.x) * 0.3;
  pos.y += cos(uTime * aRandomness.y) * 0.3;
  pos.z += sin(uTime * aRandomness.z) * 0.2;

  vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

  // Mouse repulsion in screen space
  vec4 projected = projectionMatrix * mvPosition;
  vec2 screenPos = projected.xy / projected.w;
  float distToMouse = distance(screenPos, uMouse);
  float repulsion = smoothstep(uMouseRadius, 0.0, distToMouse);

  mvPosition.xy += normalize(screenPos - uMouse + 0.001) * repulsion * 0.5;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  // Re-project with repulsion
  gl_Position.xy += normalize(screenPos - uMouse + 0.001) * repulsion * 0.3;

  gl_PointSize = uSize * aScale * (1.0 + repulsion * 2.0);
  gl_PointSize *= (300.0 / -mvPosition.z);

  // Color based on position + mouse proximity
  float hue = length(pos) * 0.15 + uTime * 0.05;
  vColor = vec3(
    0.5 + 0.5 * sin(hue * 6.28),
    0.5 + 0.5 * sin(hue * 6.28 + 2.09),
    0.5 + 0.5 * sin(hue * 6.28 + 4.19)
  );
  vColor = mix(vColor, vec3(1.0), repulsion * 0.5);
  vAlpha = 0.6 + repulsion * 0.4;
}
