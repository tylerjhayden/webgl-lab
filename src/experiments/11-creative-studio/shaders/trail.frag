uniform vec3 uColor;

varying float vOpacity;

void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;

  // Hot white core fading to accent color along the trail
  vec3 col = mix(uColor, vec3(1.0), vOpacity * vOpacity * 0.6);

  // Softer, wider glow
  float alpha = smoothstep(0.5, 0.08, dist) * vOpacity * 0.7;
  gl_FragColor = vec4(col, alpha);
}
