uniform vec3 uColor;

varying float vOpacity;

void main() {
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;

  float alpha = smoothstep(0.5, 0.15, dist) * vOpacity * 0.6;
  gl_FragColor = vec4(uColor, alpha);
}
