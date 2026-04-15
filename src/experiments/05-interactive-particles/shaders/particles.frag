varying vec3 vColor;
varying float vAlpha;

void main() {
  // Soft circle shape
  float dist = distance(gl_PointCoord, vec2(0.5));
  if (dist > 0.5) discard;

  float alpha = vAlpha * smoothstep(0.5, 0.2, dist);
  gl_FragColor = vec4(vColor, alpha);
}
