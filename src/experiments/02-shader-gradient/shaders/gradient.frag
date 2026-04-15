varying vec2 vUv;
varying float vElevation;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;

void main() {
  float mixVal = vUv.y + vElevation * 2.0 + sin(uTime * 0.5) * 0.1;
  vec3 color = mix(uColorA, uColorB, mixVal);

  // Add subtle shimmer
  color += 0.05 * sin(vUv.x * 20.0 + uTime * 2.0);

  gl_FragColor = vec4(color, 1.0);
}
