varying vec2 vUv;
varying float vElevation;

uniform float uTime;
uniform float uAmplitude;

void main() {
  vUv = uv;

  vec3 pos = position;
  float elevation = sin(pos.x * 3.0 + uTime) * sin(pos.y * 3.0 + uTime) * uAmplitude;
  pos.z += elevation;
  vElevation = elevation;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
