attribute float aSize;
attribute float aOpacity;

uniform float uPointScale;

varying float vOpacity;

void main() {
  vOpacity = aOpacity;
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = uPointScale * aSize;
}
